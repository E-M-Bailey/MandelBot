class Queue {
	_data
	_capacity
	_length
	_offset

	constructor(capacity = 0) {
		this._data = data;
		this._length = 0;
		this._capacity = capacity;
		this._start = 0;
	}

	at(index) {
		if (index < 0) { // Negatives count from the end.
			index += this._length
		}
		if (index < 0 || index >= this._length) {
			return undefined;
		}
		return this._data[(this._offset + index) % _capacity];
	}

}