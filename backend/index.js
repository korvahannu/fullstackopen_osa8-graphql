const { ApolloServer, UserInputError, PubSub } = require('apollo-server')
const pubsub = new PubSub();
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typedefs');

const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const webtoken = require('jsonwebtoken');
const jwt_secret = 'secret_really_should_be_in_env'

const MONGODB_URI = 'url'

console.log('Connecting to MongoDB . . . ');
mongoose.connect(MONGODB_URI)
.then(() => console.log('. . . connected to MongoDB successfully!'))
.catch((error) => console.log('Failed to connect to MongoDB: ' + error));


const resolvers = {
  Query: {
      bookCount: () => {
        return Book.collection.countDocuments()
      },
      authorCount: () => Author.collection.countDocuments(),

      allBooks: async (root, args) => {
        
        let returnTable = await Book.find({}).populate('author');

        if(args.author)
        {
          // Author otetaan vastaan nimellä, joten pitää hakea nimen perusteella sen ihmisen ID
          const author = await Author.findOne({name: args.author});
          const id = author._id;

          returnTable = returnTable.filter(b => b.author.equals(id));
        }
        
        if(args.genre)
          returnTable = returnTable.filter(b => b.genres.includes(args.genre));
        return returnTable;
      },

      allAuthors: async () => {
        const authors = await Author.find({}).populate('authorOf');
        return authors;
      },

      me: (root, args, context) => {
        return context.currentUser
      }
  },

  Author: {
    books: async (root) => {

      return root.authorOf.length;

    },

    name: async (root) => {
      if(root.name)
        return root.name;
      else
        return root;
    }
  },

  Book: {
    author: async (root) => {
      const author = await Author.findOne({_id:root.author});
      return author.name;
    }
  },

  Mutation: {
    addBook: async (root, args, {currentUser}) => {

      if(!currentUser)
        throw new UserInputError('not authenticated');

      if(args.title.length < 2)
        throw new UserInputError('book title too short');

      const aut = await Author.findOne({name: args.author});
      const book = new Book({...args, author: aut._id});

      try {
        await book.save();
        await Author.findOneAndUpdate({_id:book.author}, {authorOf:[...aut.authorOf, book._id ]})
        pubsub.publish('BOOK_ADDED', {bookAdded: book});

        return book;
      }
      catch(error) {
        throw new UserInputError('Invalid arguments')
      }

    },

    editAuthor: async (root, args, {currentUser}) => {

      if(!currentUser)
        throw new UserInputError('not authenticated');

      try
      {
        const result = await Author.findOneAndUpdate({name: args.name}, {born: args.setBornTo}, {new:true})
        return result;
      }
      catch(error)
      {
        console.log('Jinkies! something went wrong');
      }
      
    },

    addAuthor: (root, args, {currentUser}) => {

      if(!currentUser)
        throw new UserInputError('not authenticated');

      if(args.name < 4)
        throw new UserInputError('author name too short');

      const newAuthor = new Author({...args});

      return newAuthor.save();
    },

    createUser: (root, args, {currentUser}) => {

      //if(!currentUser)
      //  throw new UserInputError('not authenticated');
        
      if(args.username.length < 4)
        throw new UserInputError('name too short')

      const newUser = new User({...args});

      return newUser.save();
    },

    login: async (root, args) => {

      const user = await User.findOne({username: args.username});

      if(!user || args.password !== 'root') { // Kovakoodattu salasana
        throw new UserInputError('invalid credentials');
      }

      const token = {
        username: user.username,
        id: user._id
      }

      return {
        value: webtoken.sign(token, jwt_secret) // Palautetaan tokeni frontendille
      }
    }
  },
  Subscription: {

    bookAdded: {
      
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])

    }
  }

}

const server = new ApolloServer({
  typeDefs,   // Sisältää queryt
  resolvers,  // Sisältää miten queryihin vastataan
  context: async({req}) => {

    const auth = req ? req.headers.authorization : null;

    if(auth && auth.toLocaleLowerCase().startsWith('bearer '))  // Onko pyynnön headereissa bearer eli tokeni jolla voidaan authorizoida
    {                                                           // Frontendin tehtävä on hoitaa token jokaiseen pyyntöön mukaan
      const decodedToken = webtoken.verify(auth.substring(7), jwt_secret);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser }; // Tähän resolverit pääsee käsiksi joko context.currentUser tai ottamalla { currentUser } kolmantena argumenttina
    }

  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Server ready for subscriptions at ${subscriptionsUrl}`);
})