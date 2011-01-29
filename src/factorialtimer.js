FactorialTimer = function() {
	var time = new Date().getTime(),
	lastTime = 0,
	sleepTime = 50,
	callback;

	this.start = function(callbackFn) {
		callback = callbackFn;
		setInterval(step, 50);
	};

	var step = function() {
		/*
		time = Math.floor((new Date().getTime() - time) * 0.9 + lastTime * 0.1);
		lastTime = time;
		if (time > 50 && sleepTime > 45) {
			sleepTime--;
		} else if (time < 50 && sleepTime < 55) {
			sleepTime++;
		}
		time = new Date().getTime();
        */
		callback();

	};
};

