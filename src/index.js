const { ApolloServer, gql, PubSub } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: Int!,
    username: String!,
    email: String!,
    password: String!,
    computedPassword: String!,
    userChild: UserChild!
  }

  type UserChild {
    childName: String!
  }

  input UserInfo {
    email: String!,
    password: String!
  }

  type RegisterResponse {
    errors: [String!],
    user: User!
  }

  type Query {
    hello(name: String): String!
    getUser: User
  }

  type Mutation {
    register(userInfo: UserInfo!): RegisterResponse!
    login(userInfo: UserInfo): Boolean!
  }

  type Subscription {
    newUser: User!
  }
`;

const NEW_USER = 'new_user';

const resolvers = {
  UserChild: {
    childName: (parent) => {
      console.log(parent);
      return parent.childName;
    }
  },
  Subscription: {
    newUser: {
      subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(NEW_USER)
    }
  },

  User: {
    username: (parent) => {
      console.log(parent); 
      return "hardcode this username"
    },
    computedPassword: (parent) => {
      return parent.password[0];
    },
    userChild: (parent) => {
      return { ...parent.userChild, childName: "ChangedSon" }
    }
  },

  Query: {
    hello: (parent, { name }, context, info) => `Hello World ${name}`,
  },

  Mutation: {
    register: (_, __, { pubSub }) => {
      const user = {
        id: 1,
        username: "nimit",
        password: "secret",
        userChild: {
          childName: "Son2"
        }
      }
      pubSub.publish(NEW_USER, {
        newUser: user
      })
      return {
        user
      }
    }
  }

};

const pubSub = new PubSub();
const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  context: () => ({ pubSub }) 
});

server.listen().then(({ url }) => console.log(`Listening on ${url}`));