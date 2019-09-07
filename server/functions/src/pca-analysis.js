const { PCA } = require('ml-pca');
const http = require('https');

let req = http.get("https://us-central1-safe-21981.cloudfunctions.net/events", function(res) {
	var dataset = [];
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
		json_data = JSON.parse(data);
		// console.log(Object.values(json_data)[0][1]);

		var points = Object.values(json_data)[0];

		for( let prop in points ){
			const row = [points[prop]['location']['_latitude'], points[prop]['location']['_longitude'], points[prop]['time']['_seconds']];
			dataset.push(row);
		}

		console.log(dataset);

	});
});

req.on('error', function(e) {
    console.log(e.message);
});

// dataset is a two-dimensional array where rows represent the samples and columns the features

//const pca = new PCA(dataset);
//console.log(pca.getExplainedVariance());

//const newPoints = [[4.9, 3.2, 1.2, 0.4], [5.4, 3.3, 1.4, 0.9]];
//console.log(pca.predict(newPoints));
