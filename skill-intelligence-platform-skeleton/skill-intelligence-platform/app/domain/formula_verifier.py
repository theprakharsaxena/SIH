"""
app/domain/formula_verifier.py

Safe AST arithmetic evaluator, statistical primitives composer (Tier 2),
and formula application verifier.

Allows safe execution of AST arithmetic expressions and primitive operations:
Primitives: mean, variance, stdev, covariance, correlation, growth_rate, sum, len, min, max.
"""
import ast
import math
import operator
from app.domain.formula_library import FORMULA_REGISTRY
from app.domain.numeric_validator import extract_numbers

_ALLOWED_OPERATORS = {
    ast.Add: operator.add, ast.Sub: operator.sub,
    ast.Mult: operator.mul, ast.Div: operator.truediv,
    ast.Mod: operator.mod, ast.Pow: operator.pow,
    ast.USub: operator.neg,
}


class UnsafeExpressionError(ValueError):
    pass


def safe_eval(expr: str) -> float:
    tree = ast.parse(expr, mode="eval")

    def _eval(node):
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_OPERATORS:
            return _ALLOWED_OPERATORS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_OPERATORS:
            return _ALLOWED_OPERATORS[type(node.op)](_eval(node.operand))
        raise UnsafeExpressionError(f"Disallowed expression element: {ast.dump(node)}")

    return _eval(tree)


def _p_mean(xs):
    return sum(xs) / len(xs)

def _p_variance(xs):
    m = _p_mean(xs)
    return sum((x - m) ** 2 for x in xs) / (len(xs) - 1)

def _p_stdev(xs):
    return math.sqrt(_p_variance(xs))

def _p_covariance(xs, ys):
    if len(xs) != len(ys):
        raise UnsafeExpressionError("covariance requires equal-length lists")
    mx, my = _p_mean(xs), _p_mean(ys)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (len(xs) - 1)

def _p_correlation(xs, ys):
    return _p_covariance(xs, ys) / (_p_stdev(xs) * _p_stdev(ys))

def _p_growth_rate(old, new):
    if old == 0:
        raise UnsafeExpressionError("growth_rate requires non-zero base value")
    return (new - old) / old * 100


PRIMITIVES = {
    "mean": _p_mean, "variance": _p_variance, "stdev": _p_stdev,
    "sum": sum, "count": len, "covariance": _p_covariance,
    "correlation": _p_correlation, "growth_rate": _p_growth_rate,
    "min": min, "max": max,
}


def safe_eval_v2(expr: str):
    """AST evaluator extended with list literals and whitelisted statistical primitives."""
    tree = ast.parse(expr, mode="eval")

    def _eval(node):
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.List):
            return [_eval(e) for e in node.elts]
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_OPERATORS:
            return _ALLOWED_OPERATORS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_OPERATORS:
            return _ALLOWED_OPERATORS[type(node.op)](_eval(node.operand))
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in PRIMITIVES:
                raise UnsafeExpressionError(f"Call to unregistered function: {ast.dump(node.func)}")
            args = [_eval(a) for a in node.args]
            return PRIMITIVES[node.func.id](*args)
        raise UnsafeExpressionError(f"Disallowed expression element: {ast.dump(node)}")

    return _eval(tree)


def _flatten_args_to_text(args: dict) -> str:
    parts = []
    for v in args.values():
        if isinstance(v, (list, tuple)):
            parts.extend(str(x) for x in v)
        else:
            parts.append(str(v))
    return " ".join(parts)


def validate_formula_application(mcq: dict, chunk_text: str, tolerance: float = 0.01) -> tuple[bool, str]:
    if mcq.get("skip", False) or "computation" not in mcq:
        return True, "Not a formula-application question, nothing to verify"

    comp = mcq["computation"]
    comp_type = comp.get("type")

    if comp_type == "expression":
        expr, claimed = comp.get("expression"), comp.get("claimed_result")
        if expr is None or claimed is None:
            return False, "Formula question missing 'expression' or 'claimed_result'"
        try:
            actual = safe_eval(expr)
        except (UnsafeExpressionError, SyntaxError, ZeroDivisionError) as e:
            return False, f"Could not independently verify expression '{expr}': {e}"
        inputs_text = str(expr)

    elif comp_type == "primitive_expression":
        expr, claimed = comp.get("expression"), comp.get("claimed_result")
        if expr is None or claimed is None:
            return False, "Primitive formula question missing 'expression' or 'claimed_result'"
        try:
            actual = safe_eval_v2(expr)
        except (UnsafeExpressionError, SyntaxError, ZeroDivisionError) as e:
            return False, f"Could not independently verify primitive expression '{expr}': {e}"
        inputs_text = str(expr)

    elif comp_type == "named_function":
        fn_name, args, claimed = comp.get("function"), comp.get("args"), comp.get("claimed_result")
        if fn_name not in FORMULA_REGISTRY:
            return False, f"'{fn_name}' is not a recognized formula -- cannot independently verify"
        if args is None or claimed is None:
            return False, "Named-function computation missing 'args' or 'claimed_result'"
        try:
            actual = FORMULA_REGISTRY[fn_name](**args)
        except (TypeError, ValueError, ZeroDivisionError, ArithmeticError) as e:
            return False, f"Error computing {fn_name} with given args: {e}"
        inputs_text = _flatten_args_to_text(args)

    else:
        return False, f"Unknown computation type: {comp_type!r}"

    source_numbers = extract_numbers(chunk_text)
    not_grounded = {n for n in extract_numbers(inputs_text) if n not in source_numbers}
    if not_grounded:
        return False, f"Computation inputs not found in source chunk: {not_grounded}"

    scale = max(abs(actual), 1e-9)
    if abs(actual - float(claimed)) > tolerance * scale:
        return False, f"Computed {actual:.4f} using {comp_type}, but question claims {claimed} -- mismatch"

    correct_key = mcq.get("correct_option") or mcq.get("correct_option_id")
    options = mcq.get("options", {})
    if isinstance(options, list):
        options = {opt.get("id"): opt.get("text") for opt in options if isinstance(opt, dict)}

    correct_numbers = extract_numbers(options.get(correct_key, ""))
    if not any(abs(actual - float(n)) <= tolerance * scale for n in correct_numbers):
        return False, f"Computed value {actual:.4f} does not match the marked correct option"

    return True, f"Independently verified via {comp_type}: result = {actual:.4f}, matches claimed result and correct option"
