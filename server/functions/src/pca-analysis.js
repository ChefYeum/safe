const { PCA } = require('ml-pca');
const http = require('https');

let req = http.get("https://us-central1-safe-21981.cloudfunctions.net/events", function(res) {
	var dataset = [];
	var timeInterval = 30*60;

	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
		json_data = JSON.parse(data);
		// console.log(Object.values(json_data)[0][1]);

		var points = Object.values(json_data)[0];

		for(let prop in points ){
			const row = [points[prop]['time'], Number.parseFloat(points[prop]['location']['_latitude']), Number.parseFloat(points[prop]['location']['_longitude'])];
			dataset.push(row);
		};

		// sorts by timestamp (first column)
		dataset.sort(function(a,b) {
			return a[0]-b[0]
		});

		function getBuckets(timeInterval, arr, output) {
			if (arr.length === 0) {
				return output
			}

			if (arr.length === 1) {
				output.push(arr[0]);
				return output;
			}

			var first = arr[0][0];
			var bucket = arr.filter(([time, lat, lng]) => time <= first + timeInterval);
			output.push(bucket);
			reduced_arr = arr.slice(bucket.length, arr.length-1);
			return getBuckets(timeInterval, reduced_arr, output);
		}

		const dataByTime = getBuckets(timeInterval, dataset, []);

		console.log(dataByTime);

		pcaMatrices = [];

		for (let item in dataByTime) {
			var dataCoordinates = dataByTime[item].map(([time, lat, lng]) => [lat, lng]);
			const pca = new PCA(dataCoordinates);
			eigenvectors = pca.getEigenvectors();
			pcaMatrices.push(eigenvectors);
		}
		console.log(pcaMatrices);
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
