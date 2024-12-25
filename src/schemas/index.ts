import { maxLength, minLength, nonEmpty, pipe, string, trim } from "valibot";

export function search() {
  return pipe(
    string("Should be string"),
    trim(),
  );
}

export function title() {
  return pipe(
    string("Should be string"),
    trim(),
    nonEmpty("Shoud not be empty"),
    minLength(3, "Number of characters should be more than 2"),
    maxLength(150, "Number of characters should be less than 151"),
  );
}

export function content() {
  return pipe(
    string("Should be string"),
    trim(),
    nonEmpty("Shoud not be empty"),
    minLength(3, "Number of characters should be more than 2"),
    maxLength(2048, "Number of characters should be less than 2049"),
  );
}
