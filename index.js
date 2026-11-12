import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db= mongoClient.db("wanderlust")
const destinationCollection = db.collection("destinations");
const bookingCollection = db.collection("bookings")
 

app.post("/add-destination",async (req, res) => {
    const data = req.body;
    const result =await destinationCollection.insertOne(data)
    
  res.send(result);
});

app.post("/booking",async(req,res)=>{
    const data = req.body
    const result= await bookingCollection.insertOne(data)
    res.send(result)

})

app.get("/my-bookings/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const result = await bookingCollection
      .find({ "user.email": email })
      .toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("My bookings error:", error);

    res.status(500).send({
      message: "Failed to fetch bookings",
    });
  }
});


app.get("/destinations",async (req,res)=>{
    const result = await destinationCollection.find().toArray()
    res.send(result)
})

app.get("/destinations/:id",async (req,res)=>{
    const id = req.params.id
    const result = await destinationCollection.findOne({_id:new ObjectId(id)})
    res.send(result)
})

app.patch("/destinations/:id",async (req,res)=>{
    const id = req.params.id
    const data = req.body
    const result = await destinationCollection.updateOne({_id:new ObjectId(id)},{$set:data})
    res.send(result)
})


   app.delete("/destinations/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid destination ID",
      });
    }

    const result = await destinationCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "Destination not found",
      });
    }

    res.status(200).send({
      message: "Destination deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to delete destination",
    });
  }
});

app.delete("/booking/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "Booking not found",
      });
    }

    res.status(200).send({
      message: "Booking cancelled successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to cancel booking",
    });
  }
});


app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
