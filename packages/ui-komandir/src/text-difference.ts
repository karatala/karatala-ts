export interface TextDifference {
  changed: string;
  prefix: string;
  suffix: string;
}

export function splitTextDifference(value: string, comparisonValue: string): TextDifference {
  let prefixLength = 0;
  const maximumPrefixLength = Math.min(value.length, comparisonValue.length);
  while (prefixLength < maximumPrefixLength && value[prefixLength] === comparisonValue[prefixLength]) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  const maximumSuffixLength = Math.min(value.length - prefixLength, comparisonValue.length - prefixLength);
  while (suffixLength < maximumSuffixLength && value[value.length - suffixLength - 1] === comparisonValue[comparisonValue.length - suffixLength - 1]) {
    suffixLength += 1;
  }

  return {
    changed: value.slice(prefixLength, suffixLength > 0 ? value.length - suffixLength : undefined),
    prefix: value.slice(0, prefixLength),
    suffix: suffixLength > 0 ? value.slice(value.length - suffixLength) : "",
  };
}
