import { object, string, TypeOf } from 'zod';

export const postDetails = object({
  body: object({
    _id: string().optional(),
    title: string({
      required_error: 'Please provide your post title!'
    }),
    description: string({
      required_error: 'Please provide your post description!'
    })
  })
});

export type PostDetails = TypeOf<typeof postDetails>['body'];
