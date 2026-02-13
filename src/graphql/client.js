import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
})
