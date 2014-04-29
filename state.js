var Queue = function () {
    this.taskList = [];
    this.callBackList =[];
    this.tasking=false;
    this.validFunc=new function(){}//由用户自行覆盖，用于校验是否满足条件
};


Queue.prototype.push= function(task,callBack){
    this.taskList.push(task);
    this.callBackList.push(callBack);
    if(this.taskList.length>0 &&!this.tasking){
        this.dotask();
        console.log("start...");
        this.tasking = true;
    }
}

Queue.prototype.shift= function(){
    this.taskList.shift();
    this.callBackList.shift();
    if(this.taskList.length===0 &&this.tasking){
        this.tasking = false;
        console.log("end...");
    }
}

Queue.prototype.dotask = function(){
    var valid = this.validFunc(null);
    if(valid[0]){
        this._task(this.taskList[0],this.callBackList[0]);
    }else{
        this.callBackList[0](valid[0],valid[1]);
        this.shift();
    }
}


Queue.prototype._task = function(task,callBack){
    var self = this;
    task(function(isSucc,result) {//框架注入的回调函数,如果用户不执行回调，链式将会断掉，无法返回
        if (isSucc === false) {
            callBack(false,result);//这里的result在isSucc为false的时候表示错误信息;程序中断，后面再这种考虑情况
        } else {
            var valid = self.validFunc(result);
            callBack(valid[0],valid[1]);
          self.shift();
          self.tasking&&self.dotask();
        }
    });
}