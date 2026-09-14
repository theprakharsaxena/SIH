"""
app/domain/formula_library.py

Whitelisted library of standard named statistical formulas:
- weighted_arithmetic_mean
- weighted_geometric_mean
- laspeyres_price_index
- paasche_price_index
- percentage_change
- coefficient_of_variation
- standard_error_of_mean
"""
import math

def weighted_arithmetic_mean(values: list[float], weights: list[float]) -> float:
    if len(values) != len(weights) or not values:
        raise ValueError("values and weights must be same non-zero length")
    return sum(v * w for v, w in zip(values, weights)) / sum(weights)


def weighted_geometric_mean(values: list[float], weights: list[float]) -> float:
    if len(values) != len(weights) or not values:
        raise ValueError("values and weights must be same non-zero length")
    if any(v <= 0 for v in values):
        raise ValueError("geometric mean requires strictly positive values")
    log_sum = sum(w * math.log(v) for v, w in zip(values, weights))
    return math.exp(log_sum / sum(weights))


def laspeyres_price_index(base_prices: list[float], current_prices: list[float],
                           base_quantities: list[float]) -> float:
    n = len(base_prices)
    if not (n == len(current_prices) == len(base_quantities)) or n == 0:
        raise ValueError("all three lists must be the same non-zero length")
    numerator = sum(current_prices[i] * base_quantities[i] for i in range(n))
    denominator = sum(base_prices[i] * base_quantities[i] for i in range(n))
    return (numerator / denominator) * 100


def paasche_price_index(base_prices: list[float], current_prices: list[float],
                         current_quantities: list[float]) -> float:
    n = len(base_prices)
    if not (n == len(current_prices) == len(current_quantities)) or n == 0:
        raise ValueError("all three lists must be the same non-zero length")
    numerator = sum(current_prices[i] * current_quantities[i] for i in range(n))
    denominator = sum(base_prices[i] * current_quantities[i] for i in range(n))
    return (numerator / denominator) * 100


def percentage_change(old_value: float, new_value: float) -> float:
    if old_value == 0:
        raise ValueError("cannot compute percentage change from zero")
    return (new_value - old_value) / old_value * 100


def coefficient_of_variation(std_dev: float, mean: float) -> float:
    if mean == 0:
        raise ValueError("cannot compute coefficient of variation with zero mean")
    return (std_dev / mean) * 100


def standard_error_of_mean(std_dev: float, sample_size: float) -> float:
    if sample_size <= 0:
        raise ValueError("sample_size must be positive")
    return std_dev / math.sqrt(sample_size)


FORMULA_REGISTRY = {
    "weighted_arithmetic_mean": weighted_arithmetic_mean,
    "weighted_geometric_mean": weighted_geometric_mean,
    "laspeyres_price_index": laspeyres_price_index,
    "paasche_price_index": paasche_price_index,
    "percentage_change": percentage_change,
    "coefficient_of_variation": coefficient_of_variation,
    "standard_error_of_mean": standard_error_of_mean,
}
