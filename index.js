const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.32bwvbv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const spotCollection = client.db("spotDB").collection("spot");

    app.post("/addSpot", async (req, res) => {
      const newSpot = req.body;
      console.log(newSpot);
      const result = await spotCollection.insertOne(req.body);
      console.log(result);
      res.send(result);
    });
    app.get('/spot', async (req, res) => {
      console.log(req);
      const cursor = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

    app.put("/singleSpot/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSpot = req.body;

      const spot = {
        $set: {
        country_Name : updatedSpot.country_Name,
        tourists_spot_name : updatedSpot.tourists_spot_name,
        average_cost : updatedSpot.average_cost,
        location : updatedSpot.location,
        seasonality: updatedSpot.seasonality,
        travel_time: updatedSpot.travel_time,
        totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear,
        description: updatedSpot.description,
        photo: updatedSpot.photo
        },
      };

      const result = await spotCollection.updateOne(filter, spot, options);
      res.send(result);
    });

    app.get("/mySpot/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await spotCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/singleSpot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const result = await spotCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("tourism management server is running");
});

app.listen(port, () => {
  console.log(`tourism management server is running on port: ${port}`);
});
