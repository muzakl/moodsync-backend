import {MongoClient} from "mongodb";

const uri = `mongodb+srv://nikoo:Nikson123@cluster0.f6xsw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
        return client.db('Moodsync');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

export {connectToDatabase, client};
