jsutil
======

参考了第三方插件async.js，提供简单方法用来处理同步与异步多个任务之间的回调关系。  

 * 处理多个任务的同步和异步调用,单例模式
 * 支持同步方式和异步方式，同步执行的话，每一步能取到前面的返回值，异步则只有在最后的回调方法里面才能取到
 * 此方法正常有三个参数，第一个是目标方法组合，第二个是所有任务完成的最终回调方法，第三个是所有任务共享的变量param，可为空
 * 目标方法会默认被注入第一个参数callback，此回调方法第一个参数是表示调用是否成功，后面的参数分别表示返回值，可以传递多个值
 * 目标方法会默认被注入第二个参数param，此参数是所有任务共享的初始化变量,如果外层方法没有此变量，这里也不会出现
 * 目标方法会默认被注入第三个参数results，此参数是在同步任务中，前面任务的返回值，数组格式一一对应
 * 最终回调方法默认被注入的两个参数分别为任务是否都完成的标识和最终的任务返回值，
 * 任务返回值类型跟目标方法的组合类型一致，要么都是数组要么都是对象，数组的话顺序与目标方法列表顺序一致，对象的话，键值一致。

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