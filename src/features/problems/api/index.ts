import { type Problem, type ProblemShortArray, validateSchema, validateShortSchemaArray } from "$api/schemas/problems";
import { ApiClient, apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import type { ApiError, ApiModelError, FetchError, JsonDeserializeError } from "$lib/error";
import { isErr, type Result } from "$lib/superposition";
import { type UuidSchemaError, validateUuid } from "$schemas/uuid";
import { type CreateSchemaError, validateCreateSchema } from "../schemas/create";
import { type SearchSchemaError, validateSearchSchema } from "../schemas/search";
import { type UpdateSchemaError, validateUpdateSchema } from "../schemas/update";

export class ProblemApiClient extends ApiClient {
  constructor(options: ApiClientOptions = apiClientOptions) {
    super(options);
  }

  async searchShortsByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<
    Result<ProblemShortArray, SearchSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>
  > {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("problems", this.apiClientOptions.options.url);
    url.searchParams.append("search", search);

    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateShortSchemaArray, extra);
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Problem, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid problem id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`problems/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchema, extra);
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Problem, CreateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const problem = parsed.unwrap();
    const url = new URL("problems", this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "POST",
        body: JSON.stringify({
          ...problem,
          tags: problem.tags?.split(",") ?? null,
          equations: problem.equations?.split(",") ?? null,
          concepts: problem.concepts?.split(",") ?? null,
          images: problem.images?.split(",") ?? null,
          problems: problem.problems?.split(",") ?? null,
        }),
        headers: {
          "content-type": "application/json",
        },
      },
      validateSchema,
      extra,
    );
  }

  async update(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Problem, UpdateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const problem = parsed.unwrap();
    const url = new URL(`problems/id/${problem.id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...problem,
          tags: problem.tags?.split(",") ?? null,
          equations: problem.equations?.split(",") ?? null,
          concepts: problem.concepts?.split(",") ?? null,
          images: problem.images?.split(",") ?? null,
          problems: problem.problems?.split(",") ?? null,
        }),
        headers: {
          "content-type": "application/json",
        },
      },
      validateSchema,
      extra,
    );
  }

  async delete(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Problem, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid concept id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();

    const url = new URL(`problems/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "DELETE" }, validateSchema, extra);
  }
}
