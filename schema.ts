export const schema = `#graphql
type User{
  id: ID!
  name: String!
  password: String!
  email: String!
  posts: [Post!]!
  comments: [Comment!]!
  likedPosts: [Post!]!
}
type Post {
  id: ID!
  content: String!
  author: User!
  comments: [Comment!]!
  likes: [User!]!
}
 
type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  
  posts: [Post!]!
  post(id: ID!): Post
  
  comments: [Comment!]!
  comment(id: ID!): Comment
}
 
# Mutations
type Mutation {
  createUser(id: ID!, name: String!, password: String!, email: String!, posts: [ID!]!, comments: [ID!]!, likedPosts: [ID!]!): User!
  deleteUser(id: ID!): Boolean!

  createPost(id: ID!, content: String!, author: ID!, comments: [ID!]!, likes: [ID!]!): Post!
  deletePost(id: ID!): Boolean!

  createComment(id: ID!, text: String!, author: ID!, post: ID!): Comment!
  deleteComment(id: ID!): Boolean!
}

`;
