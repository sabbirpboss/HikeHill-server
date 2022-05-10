const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q4bl5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const itemCollection = client.db("hikeHill").collection("item");

    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);
      res.send(item);
    });

    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const updateGear = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateGear.name,
          supplier: updateGear.supplier,
          price: updateGear.price,
          quantity: updateGear.quantity,
          description: updateGear.description,
          image: updateGear.image,
        },
      };
      const result = await itemCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);

      app.post("/product", async (req, res) => {
        const newItem = req.body;
        const result = await itemCollection.insertOne(newItem);
        res.send(result);
      });
    });

    app.get('/myinventory', verifyJWT, async (req, res) => {
      const decodedEmail = req?.decoded?.email;
      const email = req?.query?.email;
      if (email === decodedEmail) {
          const query = { userEmail: email };
          const cursor = inventoryCollection.find(query);
          const cars = await cursor.toArray();
          res.send(cars);
      }
      else {
          res.status(403).send({ message: 'Forbidden access' })
      }
  })
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("HikeHill Server is Running!!!");
});

app.listen(port, () => {
  console.log("HikeHill Listenning to port", port);
});
