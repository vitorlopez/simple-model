import _ from 'lodash';

export class ModelBase {
	constructor() {
		this.baseUrl = null;
		this.defaultHeaders = null;
	}

	setBaseUrl(url) {
		this.baseUrl = url;
	}

	setDefaultHeaders(headers) {
		this.degaultHeaders = headers;
	}

	create(modelName, customMethods = {}) {

		var model = this.$resource(this.getBaseUrl() + modelName, {}, angular.extend({
			getList: {
				method: 'GET',
				isArray: true,
				responseType: 'json',
				transformResponse: function (data) {
					if (data && data.content) {
						return data.content;
					}

					return data;
				}
			},

			getOne: {
				method: 'GET',
				isArray: false,
				responseType: 'json'
			},

			create: {
				method: 'POST',
				isArray: false,
				responseType: 'json'
			},

			remove: {
				method: 'DELETE',
				isArray: false,
				responseType: 'json',
				params: {
					id: "@id"
				}
			},

			update: {
				method: 'PUT',
				isArray: false,
				responseType: 'json',
				params: {
					id: "@id"
				}
			}
		}, customMethods));

		model.prototype.$save = function() {
			if ( !this.id ) {
				return this.$create.apply(this, arguments);
			}
			else {
				return this.$update.apply(this, arguments);
			}
		};

		return model;
	}

	getDefaultHeaders() {
		return this.degaultHeaders;
	}

	getBaseUrl() {
		return this.baseUrl;
	}

	$get($resource, $http) {
		this.$resource = $resource;

		$http.defaults.headers.common = this.getDefaultHeaders();

		return this;
	}

	print(config) {
		var _data;

		function ArraybufferToString(bfArray) {
		    var encodedString = String.fromCharCode.apply(null, new Uint8Array(bfArray)),
		        decodedString = decodeURIComponent(escape(encodedString));
		    return decodedString;
		}

		return angular.extend({
			method: 'GET',
			headers: {
				accept: 'application/pdf'
			},
			responseType: 'arraybuffer',
			transformRequest: (data) => {
				_data = _.clone(data);
				return JSON.stringify(data);
			},
			transformResponse: (data, typeFn, codeRequest) => {
				var pdf, fileURL;

				if ( codeRequest === 200 ) {
					pdf = new Blob([data], { type: 'application/pdf' });
					fileURL = URL.createObjectURL(pdf);
					window.open(fileURL);
				} else {
					return JSON.parse(ArraybufferToString(data));
				}

				return _data;
			}
		}, config);
	}
}