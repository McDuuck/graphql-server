const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 */

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]


const typeDefs = `
    type Book {
        title: String
        published: Int
        author: String
        genres: [String]
    }

    type Authors {
        name: String
        bookCount: Int
        born: Int
    }

    type Query {
        bookCount: Int
        authorCount: Int
        allBooks(author: String, genre: String): [Book]
        allAuthors: [Authors]
    }

    type Mutation {
        addBook(
            title: String
            published: Int
            author: String
            genres: [String]
        ): Book
        editAuthor(
            name: String
            setBornTo: Int
        ): Authors
    }
`


const resolvers = {
    Query: {
      bookCount: () => books.length,
      authorCount: () => authors.length,
      allBooks: (root, args) => {
        let result = books
        if (args.author) {
          result = result.filter(book => book.author === args.author)
        }
        if (args.genre) {
          result = result.filter(book => book.genres.includes(args.genre))
        }
        return result
      },
      allAuthors: () => authors.map(author => {
        const bookCount = books.filter(book => book.author === author.name).length
        return { ...author, bookCount }
      })
    },
    Mutation: {
        addBook: (root, args) => {
          const book = { ...args }
          const author = { name: args.author, bookCount: 1 }
          /* Haetaan author, katotaan onko se jo listassa,
          jos ei ole lisätään listaan ja bookCounttiin 1
          Jos on listassa lisätään vain bookCounttiin 1
          */
          const existingAuthor = authors.find(a => a.name === author.name)
          if (!existingAuthor) {
            authors = authors.concat(author)
          } else {
            existingAuthor.bookCount += 1
          }
          books = books.concat(book)
          return book
        },
        editAuthor: (root, args) => {
            // Etsitään author
            const author = authors.find(a => a.name === args.name)
          
            // Jos ei löydy palautetaan null
            if (!author) {
              return null
            }
            // Päivitetään vuosi
            author.born = args.setBornTo
            // palautetaan author
            return author
          }
      }
  }

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})