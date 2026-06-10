import pytest

from src.converters import experience_to_score, education_to_score


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("no experience", 0.0),
        ("0 years", 0.0),
        ("fresher", 0.0),
        ("entry level", 0.0),
        ("junior", 0.4),
        ("1 year", 0.4),
        ("2 years", 0.4),
        ("1-2 years", 0.4),
        ("less than 2 years", 0.4),
        ("mid", 0.7),
        ("middle", 0.7),
        ("3 years", 0.7),
        ("4 years", 0.7),
        ("3-4 years", 0.7),
        ("2-4 years", 0.7),
        ("senior", 1.0),
        ("5 years", 1.0),
        ("10+ years", 1.0),
        ("lead", 1.0),
        ("principal", 1.0),
    ],
)
def test_experience_mappings(raw, expected):
    assert experience_to_score(raw) == expected


def test_experience_case_insensitive_and_partial():
    assert experience_to_score("JUNIOR") == 0.4
    assert experience_to_score("about 3 years of experience") == 0.7


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("high school", 0.2),
        ("no degree", 0.2),
        ("secondary", 0.2),
        ("bootcamp", 0.5),
        ("diploma", 0.5),
        ("certificate", 0.5),
        ("associate", 0.5),
        ("bachelor", 0.7),
        ("bs", 0.7),
        ("ba", 0.7),
        ("undergraduate", 0.7),
        ("college", 0.7),
        ("master", 0.9),
        ("ms", 0.9),
        ("postgraduate", 0.9),
        ("phd", 1.0),
        ("doctorate", 1.0),
    ],
)
def test_education_mappings(raw, expected):
    assert education_to_score(raw) == expected


def test_education_unknown_default():
    assert education_to_score("some unknown phrase") == 0.5
