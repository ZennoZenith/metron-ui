import type { Problem, QuestionTypeLoose } from "$type/problems";
import { uuidv4 } from "$utils/helpers";
import { getContext, setContext } from "svelte";

export class InternalProblem {
  readonly _tag = "InternalProblem" as const;
  id: string = $state("");
  #psudoId: string;
  problemStatement: string = $state("");
  hint: string = $state("");
  questionType: QuestionTypeLoose = $state("MCQ");
  tags: string = $state("");
  explanation: string = $state("");
  equations: string = $state("");
  images: string = $state("");
  concepts: string = $state("");
  problems: string = $state("");
  createdAt: string = $state("");
  updatedAt: string = $state("");

  constructor(problem?: Problem) {
    // this.internalVariables.onChange(v => {});
    this.#psudoId = uuidv4();
    if (!problem) {
      return;
    }
    this.id = problem.id ?? "";
  }

  get psudoId() {
    return this.#psudoId;
  }

  public log() {
    console.log({
      id: $state.snapshot(this.id),
      psudoId: this.#psudoId,
      problemStatement: $state.snapshot(this.problemStatement),
      hint: $state.snapshot(this.hint),
      questionType: $state.snapshot(this.questionType),
      tags: $state.snapshot(this.tags),
      explanation: $state.snapshot(this.explanation),
      equations: $state.snapshot(this.equations),
      images: $state.snapshot(this.images),
      concepts: $state.snapshot(this.concepts),
      problems: $state.snapshot(this.problems),
      createdAt: $state.snapshot(this.createdAt),
      updatedAt: $state.snapshot(this.updatedAt),
    });
  }

  public toProblem() {
    return {
      id: $state.snapshot(this.id),
      problemStatement: $state.snapshot(this.problemStatement),
      hint: $state.snapshot(this.hint),
      questionType: $state.snapshot(this.questionType),
      tags: $state.snapshot(this.tags),
      explanation: $state.snapshot(this.explanation),
    };
  }
}

export function setProblemContext(
  problemContextKey: symbol,
  ...options: ConstructorParameters<typeof InternalProblem>
) {
  return setContext(problemContextKey, new InternalProblem(...options));
}

export function getProblemContext(problemContextKey: symbol) {
  const context = getContext<ReturnType<typeof setProblemContext> | undefined>(problemContextKey);

  if (!context) {
    throw new Error(
      `Could not get internal problem context from key: ${problemContextKey.toString()}`,
    );
  }
  return context;
}
