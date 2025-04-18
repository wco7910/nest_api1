export function stringToBoolean(str: string | boolean) {
  return str === 'true';
}

export function toCamelCase(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (match, letter) =>
    letter.toUpperCase(),
  );
}
