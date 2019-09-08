const { PCA } = require('ml-pca');
const http = require('https');

export const getPathPoint = (timeInterval) => {
	return new Promise((resolve, reject) => {
		let req = http.get("https://us-central1-safe-21981.cloudfunctions.net/events", function(res) {
			var dataset = [];
		
			let data = '',
				json_data;
		
			res.on('data', function(stream) {
				data += stream;
			});
			res.on('end', function() {
				json_data = JSON.parse(data);
		
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
		
				// these are all the timed buckets
				const buckets = getBuckets(timeInterval, dataset, []);
				var output = [];
				for (let i in buckets) {
					const pca = new PCA(buckets[i]);
					eigenvectors = pca.getEigenvectors();
					const principleComponent = Object.values(eigenvectors)[0][0]
					let minPoint = null;
					let minSize = Number.POSITIVE_INFINITY;
					let maxPoint = null;
					let maxSize = Number.NEGATIVE_INFINITY;
					for (let point of buckets[i]) {
						const [pcaX, pcaY] = principleComponent
						const [_, x, y] = point;
						const dotProduct = pcaX*x + pcaY*y
						const mag = Math.sqrt(x*x + y*y);
						const projection = dotProduct/mag;
						if (minSize > projection) {
							minSize = projection;
							minPoint = point;
						}
						if (maxSize < projection) {
							maxSize = projection;
							maxPoint = point;
						}
					}
					if (minPoint[0] > maxPoint[0]) {
						[minPoint, maxPoint] = [maxPoint, minPoint];
					}
					output.push([minPoint[1], minPoint[2]]);
					output.push([maxPoint[1], maxPoint[2]]);
				}
				resolve(output)
			});
		});
		
		req.on('error', reject);
	})
}
