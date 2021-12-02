module.exports = class CustomEvent {
    executors;
    hasBeenFired;
    
    constructor() {
        this.executors = [];
        this.hasBeenFired = false;
    }
    on(executor) {
        if(this.hasBeenFired) {
            executor();
        }
        this.executors.push({executor, type: 'each'})
    }
    once(executor) {
        if(this.hasBeenFired) {
            executor();
        } else {
            this.executors.push({executor, type: 'once'});
        }
    }
    emit() {
        this.hasBeenFired = true;
        this.executors.forEach(({executor, type}, index) => {
            executor();
            if(type == 'once') {
                this.executors.splice(index, 1);
            }
        });
    }
}