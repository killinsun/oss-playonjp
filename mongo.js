
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/oss-playondb";
var hoo =" hello mongodb";

//Connect MongoDB
MongoClient.connect(url, (error, db) => {
	var collection = db.collection("chatcollection");

	collection.insertOne({
		"room": 1,
		"timedate": "2017/11/15-13:00",
		"username": "killinsun",
		"icon" : "smile",
		"message": hoo
	}, (error, result) => {
		db.close();
	});

	collection.find().toArray((error,documents) => {
		for(var document of documents){
			console.log(document);
		}
	});
});
