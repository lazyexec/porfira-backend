type DayString = `${number}d`;

// Only for 1d, 10d, 30d type of strings
export function daysToDate(
  value: DayString,
  fromDate: Date = new Date()
): Date {
  const days = Number(value.replace("d", ""));

  if (Number.isNaN(days)) {
    throw new Error(`Invalid day format: ${value}`);
  }

  const result = new Date(fromDate);
  result.setDate(result.getDate() + days);

  return result;
}
