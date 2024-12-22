import { Collection, ObjectId } from "mongodb";
import { CommentModel, PostModel, User, UserModel } from "./types.ts";
import { GraphQLError } from "graphql";

type Context = {
  UsersCollection: Collection<UserModel>;
  PostCollection: Collection<PostModel>;
  CommentCollection: Collection<CommentModel>;
};

type QueryUserArgs = {
  id: string;
};

type CreateUserInput = {
  id: string;
  name: string;
  password: string;
  email: string;
  posts: string[];
  comments: string[];
  likedPosts: string[];
};

type DeleteMutationArgs = {
  id: string;
};

type CreatePostInput = {
  id: string;
  content: string;
  author: string;
  comments: string[];
  likes: string[];
};

type CreateCommentInput = {
  id: string;
  text: string;
  author: string;
  post: string;
};

export const resolvers = {
  Query: {
    users: async (
      _: unknown,
      __: unknown,
      ctx: Context,
    ): Promise<UserModel[]> => {
      return await ctx.UsersCollection.find().toArray();
    },

    user: async (
      _: unknown,
      args: QueryUserArgs,
      ctx: Context,
    ): Promise<UserModel> => {
      const { id } = args;

      const user = await ctx.UsersCollection.findOne({ _id: new ObjectId(id) });

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      return user;
    },

    posts: async (
      _: unknown,
      __: unknown,
      ctx: Context,
    ): Promise<PostModel[]> => {
      return await ctx.PostCollection.find().toArray();
    },

    post: async (
      _: unknown,
      args: QueryUserArgs,
      ctx: Context,
    ): Promise<PostModel> => {
      const { id } = args;

      const post = await ctx.PostCollection.findOne({ _id: new ObjectId(id) });

      if (!post) {
        throw new Error(`Post with ID ${id} not found`);
      }

      return post;
    },

    comments: async (
      _: unknown,
      __: unknown,
      ctx: Context,
    ): Promise<CommentModel[]> => {
      return await ctx.CommentCollection.find().toArray();
    },

    comment: async (
      _: unknown,
      args: QueryUserArgs,
      ctx: Context,
    ): Promise<CommentModel> => {
      const { id } = args;

      const comment = await ctx.CommentCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!comment) {
        throw new Error(`Comment with ID ${id} not found`);
      }

      return comment;
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      args: CreateUserInput,
      ctx: Context,
    ): Promise<UserModel> => {
      const { email, name, password, posts, comments, likedPosts } = args;
      const existsEmail = await ctx.UsersCollection.findOne({ email });
      if (existsEmail) throw new GraphQLError("Email Exists");

      const { insertedId } = await ctx.UsersCollection.insertOne({
        email,
        name,
        password,
        posts: posts.map((f) => new ObjectId(f)),
        comments: comments.map((f) => new ObjectId(f)),
        likedPosts: likedPosts.map((f) => new ObjectId(f)),
      });

      return {
        _id: insertedId,
        email,
        name,
        password,
        posts: posts.map((p) => new ObjectId(p)),
        comments: comments.map((c) => new ObjectId(c)),
        likedPosts: likedPosts.map((l) => new ObjectId(l)),
      };
    },

    deleteUser: async (
      _: unknown,
      args: DeleteMutationArgs,
      ctx: Context,
    ): Promise<boolean> => {
      const { deletedCount } = await ctx.UsersCollection.deleteOne({
        _id: new Object(args.id),
      });
      return deletedCount === 1;
    },

    createPost: async (
      _: unknown,
      args: CreatePostInput,
      ctx: Context,
    ): Promise<PostModel> => {
      const { content, author, comments, likes } = args;

      const { insertedId } = await ctx.PostCollection.insertOne({
        content,
        author: new ObjectId(),
        comments: comments.map((c) => new ObjectId(c)),
        likes: likes.map((l) => new ObjectId(l)),
      });

      return {
        _id: insertedId,
        content,
        author: new ObjectId(),
        comments: comments.map((c) => new ObjectId(c)),
        likes: likes.map((l) => new ObjectId(l)),
      };
    },

    deletePost: async (
      _: unknown,
      args: DeleteMutationArgs,
      ctx: Context,
    ): Promise<boolean> => {
      const { deletedCount } = await ctx.PostCollection.deleteOne({
        _id: new Object(args.id),
      });
      return deletedCount === 1;
    },

    createComment: async (
      _: unknown,
      args: CreateCommentInput,
      ctx: Context,
    ): Promise<CommentModel> => {
      const { text, author, post } = args;

      const { insertedId } = await ctx.CommentCollection.insertOne({
        text,
        author: new ObjectId(),
        post: new ObjectId(),
      });

      return {
        _id: insertedId,
        text,
        author: new ObjectId(),
        post: new ObjectId(),
      };
    },

    deleteComment: async (
      _: unknown,
      args: DeleteMutationArgs,
      ctx: Context,
    ): Promise<boolean> => {
      const { deletedCount } = await ctx.CommentCollection.deleteOne({
        _id: new Object(args.id),
      });
      return deletedCount === 1;
    },
  },

  User: {
    id: (parent: UserModel, _: unknown, ctx: Context) => {
      return parent._id!.toString();
    },

    posts: async (
      parent: UserModel,
      _: unknown,
      ctx: Context,
    ): Promise<PostModel[]> => {
      const ids = parent.posts;
      const posts = await ctx.PostCollection.find({ _id: { $in: ids } })
        .toArray();
      return posts;
    },

    comments: async (
      parent: UserModel,
      _: unknown,
      ctx: Context,
    ): Promise<CommentModel[]> => {
      const ids = parent.comments;
      const comments = await ctx.CommentCollection.find({ _id: { $in: ids } })
        .toArray();
      return comments;
    },
  },
};
