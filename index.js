const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send("Better Tomorrow server is running")
})

async function run() {
    try {
        await client.connect()

        const db = client.db("better_tomorrow_DB")
        const eventsCollection = db.collection("events")
        const usersCollection = db.collection("users")
        const joinedCollection = db.collection("joined")

        // API

        app.post('/events', async (req, res) => {
            const newEvent = req.body
            const result = await eventsCollection.insertOne(newEvent)
            res.send(result)
        })

        app.get('/events', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.creatorEmail = email
            }
            const cursor = eventsCollection.find(query).sort({ eventDate: 1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/events/upcoming', async (req, res) => {
            const query = {
                eventDate: { $gte: new Date().toISOString() }
            }
            const cursor = eventsCollection.find(query).sort({ eventDate: 1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.findOne(query)
            res.send(result)
        })

        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/joined', async (req, res) => {
            const joinEventData = req.body
            if (!joinEventData.userEmail || !joinEventData.eventId) {
                return res.status(400).send({ message: "Missing user or event information" })
            }
            const query = {
                userEmail: joinEventData.userEmail,
                eventId: joinEventData.eventId
            }

            const alreadyJoined = await joinedCollection.findOne(query)

            if (alreadyJoined) {
                return res.status(409).send({ message: "You have already joined this event" })
            }

            const newJoin = {
                ...joinEventData,
                joinedAt: new Date()
            }

            result = await joinedCollection.insertOne(newJoin)

            res.send(result)
        })

        app.get('/joined', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.userEmail = email
            }
            const cursor = joinedCollection.find(query)
            const result = await cursor.toArray()
            res.status(200).send(result)
        })

        app.get('/joined-events', async (req, res) => {
            const email = req.query.email

            const joinedEvents = await joinedCollection.find({ userEmail: email }).toArray()

            if (!joinedEvents.length) return res.json([])

            const eventIds = joinedEvents.map(event => new ObjectId(event.eventId))

            const matchedEvents = await eventsCollection.find({ _id: { $in: eventIds } }).toArray()

            res.send(matchedEvents)
        })

        // app.get('joined-events', async(req,res)=>{
        //     const email = req.query.email

        //     const joinedEvents = await joinedCollection.find({userEmail: email})

        //     const eventIds = joinedEvents.map(item=>item.eventId)

        //     const matchedEvents = await eventsCollection.find({_id: new ObjectId(eventIds)}).toArray()


        // })

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body
            const email = req.body.email
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                res.send({ message: "User already exist" })
            }
            else {
                const result = await usersCollection.insertOne(newUser)
                res.send(result)
            }
        })

        // Send Ping to confirm connection
        await client.db("admin").command({ ping: 1 })
        console.log("Pinged you deployment. Connected to MongoDB");
    }
    finally {

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Better Tomorrow server is running on port: ${port}`);
})