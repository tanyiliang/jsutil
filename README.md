jsutil
======

参考了第三方插件async.js，提供简单方法用来处理同步与异步多个任务之间的回调关系。
调用方式如下：

    /**
	 * 异步执行多个任务完成后执行回调方法
	 * @param  {Array}   task      任务数组
	 * @param  {Function} callback 任务都执行后的回调
	 */
	async.parallel = function(tasks, callback) {
	    ......
	}
	
	/**
	 * 同步执行多个任务完成后执行回调方法
	 * @param  {Array}   task      任务数组
	 * @param  {Function} callback 任务都执行后的回调
	 */
	async.series = function(tasks, callback) {
	    ......
	}

其中parallel是异步方式调用，参数tasks内任务可以并行执行，都执行完了会触发回调方法；而series则是同步方式调用，参数tasks内的任务只能按顺序执行，并且后一个回调能取到任务的返回值.  
两者方法的tasks参数既可以是数组，也可以是对象；返回值类型与参数类型一致.  
调用示例如下：

    <script>



      async.series([
          function(callback,results){
              setTimeout(function(){
                  console.log(1+"-->"+JSON.stringify(results));
                  callback(null, 'one');
              }, 200);
          },
          function(callback,results){
              setTimeout(function(){
                  console.log(2+"-->"+JSON.stringify(results));
                  callback(null, 'two');
              }, 100);
          }
      ],
      function(err, results){
          console.log(results);
      });


      async.series({
          one:function(callback,results){
              setTimeout(function(){
                  console.log(3+"-->"+JSON.stringify(results));
                  callback(null, 'three');
              }, 200);
          },
          two:function(callback,results){
              setTimeout(function(){
                  console.log(4+"-->"+JSON.stringify(results));
                  callback(null, 'four');
              }, 100);
          }
      },
      function(err, results){
          console.log(results);
      });

	  //series 的两个方法都是按序执行的，1，2；3，4

      async.parallel([
          function(callback,results){
              setTimeout(function(){
                  console.log(1+"-->"+JSON.stringify(results));
                  callback(null, 'one');
              }, 200);
          },
          function(callback,results){
              setTimeout(function(){
                  console.log(2+"-->"+JSON.stringify(results));
                  callback(null, 'two');
              }, 100);
          }
      ],
      function(err, results){
          console.log(results);
      });


      async.parallel({
          one:function(callback,results){
              setTimeout(function(){
                  console.log(3+"-->"+JSON.stringify(results));
                  callback(null, 'three');
              }, 200);
          },
          two:function(callback,results){
              setTimeout(function(){
                  console.log(4+"-->"+JSON.stringify(results));
                  callback(null, 'four');
              }, 100);
          }
      },
      function(err, results){
          console.log(results);
      });

	  //parallel 的两个方法都是按时间顺序执行的，2，1；4，3

      async.parallel({
          one:function(callback,results){
              setTimeout(function(){
                console.log(1+"-->"+JSON.stringify(results));
                callback(null, 'one');
              }, 200);
          },
          two:function(callback,results){
              setTimeout(function(){
                console.log(2+"-->"+JSON.stringify(results));
                callback(null, 'two');
              }, 100);
          }
      },
      function(err, results){
          console.log(results);
          async.series({
            three:function(callback){//第一个直接用results
                console.log(3+"-->"+JSON.stringify(results));
                callback(null, 'three');
            },
            four:function(callback,res){//第二个合并到第一个
                console.log(4+"-->"+JSON.stringify(extend(results,res)));
                callback(null, 'four');
            }
        },
        function(err, res){
            console.log(extend(results,res));
        });
      });

	  //综合使用 将所有无需依赖的先parallel出来，在结果集里面在使用series依次执行

      function extend(src,dst){
        for (var k in dst) {
            if (dst.hasOwnProperty(k)) {
                src[k]=dst[k];
            }
        };
        return src;
      }

    </script>