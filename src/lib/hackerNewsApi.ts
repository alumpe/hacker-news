import { z } from "zod";

const baseUrl = "https://hacker-news.firebaseio.com/v0";

const itemSchema = z.object({
  id: z.number().int(),
  deleted: z.optional(z.boolean()),
  type: z.optional(
    z.union([
      z.literal("job"),
      z.literal("story"),
      z.literal("comment"),
      z.literal("poll"),
      z.literal("pollopt"),
    ])
  ),
  by: z.optional(z.string()),
  time: z.optional(z.number()),
  text: z.optional(z.string()),
  dead: z.optional(z.boolean()),
  parent: z.optional(z.number()),
  poll: z.optional(z.number()),
  kids: z.optional(z.array(z.number())),
  url: z.optional(z.string().url()),
  score: z.optional(z.number()),
  title: z.optional(z.string()),
  parts: z.optional(z.array(z.number())),
  descendants: z.optional(z.number()),
});

export type Item = z.infer<typeof itemSchema>;

export const getTopstories = async (page = 1) => {
  const result = await (await fetch(baseUrl + "/topstories.json")).json();

  const parsedResult = z.array(z.number()).parse(result);

  const atOnce = 30;
  const start = 0 + (page - 1) * atOnce;
  const end = atOnce + (page - 1) * atOnce;

  return parsedResult.slice(start, end);
};

export const getItem = async (id: Item["id"]) => {
  const result = await (await fetch(`${baseUrl}/item/${id}.json`)).json();

  const parsedResult = itemSchema.parse(result);

  return parsedResult;
};
