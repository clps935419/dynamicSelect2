/////////////////////////
function select_search(raw_data) {
  this.raw_data = raw_data;
  this.all_select; //處理完畢的全部參數
  this.save_show_arr = []; //打開選單時候讀的arr
  this.search_arr = []; //搜尋成功的時候存的arr
  this.is_search = false; //搜尋的開關
  this.last_ele; //最後一個元素
}
//raw_data資料參數處理
select_search.prototype.data_process = function () {
  var select = this;
  var data_params_arr = select.raw_data;
  var tmp_all_params_arr = []; //將填的資料重新組裝
  ////資料處理
  $.each(data_params_arr, function (index, val) {
    var tmp_ele = $('#' + val.ele_id);
    var tmp_data = val.data;

    //判斷是PHP給資料還是單機版給資料
    //由於parseJson一定要是字串，如果是單機版JS自己製作資料 傳過來會是obj，因此要做處理
    //如果是php 傳過來的json字串則不用做處理直接parse
    if (typeof val.data === 'object') {
      tmp_data = JSON.stringify(val.data);
    }
    var tmp_data = jQuery.parseJSON(tmp_data);

    //預設選擇後的placeholder
    var tmp_ele_placeholder = placeholder_process(tmp_ele, index);
    var tmp_ele_no_results_text = tmp_ele.attr('no_results_text');
    var search_placeholder = tmp_ele.attr('search_placeholder');
    var prev_placeholder = tmp_ele.attr('prev_placeholder');
    var tmp_format_id = val.format.select_id;
    var tmp_format_text = val.format.select_text;
    var tmp_format_linkId = val.format.linkId;
    var tmp_format_mark = val.format.mark;
    var tmp_after_data = [];
    var search_condition_arr = val.search_condition_arr;

    //將placeholder塞進data
    $.each(tmp_data, function (key, value) {
      var tmp_obj = new Object({
        text: decodeURI(value[tmp_format_text]),
        id: value[tmp_format_id],
        linkId: value[tmp_format_linkId],
        mark: value[tmp_format_mark],
      });
      $.each(search_condition_arr, function (index, val) {
        tmp_obj[val] = value[val];
      });
      tmp_after_data.push(tmp_obj);
    });
    //將placeholder塞進資料前面
    tmp_after_data.unshift(tmp_ele_placeholder);

    var select_params = {
      ele: tmp_ele, //元素
      sort: index, //排序
      data: tmp_after_data, //處理完資料
      no_results_text: tmp_ele_no_results_text, //查不到結果顯示的文字
      search_placeholder: search_placeholder, //打開下拉的搜尋欄位的placeholder
      prev_placeholder: prev_placeholder,
      format: val.format, //格式
      search_condition_arr: search_condition_arr, //搜尋條件陣列
    };
    tmp_all_params_arr.push(select_params);
    select.all_select = tmp_all_params_arr; //資料存回去
  });

  /**
   *placeholder顯示處理
   *
   * @param {*} tmp_ele 帶入的元素
   * @param {*} index 排序
   * @returns
   */
  function placeholder_process(tmp_ele, index) {
    //顯示前面的placeholder
    var pre_ele_placeholder;
    //自己的placeholder \u00a0 是空白字 如果撰寫的人沒寫就是空白
    var after_select_placeholder = tmp_ele.attr('placeholder') || '\u00a0';
    if (index !== 0) {
      //不是第一個元素都要讀前面
      pre_ele_placeholder = tmp_ele.attr('prev_placeholder') || '\u00a0';
    } else if (index == 0) {
      //第一個就要讀自己的placeholder
      pre_ele_placeholder = tmp_ele.attr('placeholder') || '\u00a0';
    }
    //預設選擇後的placeholder
    var tmp_ele_placeholder = {
      id: 'def',
      text: pre_ele_placeholder,
      linkId: 'def',
      before_select_placeholder: pre_ele_placeholder,
      after_select_placeholder: after_select_placeholder,
    };
    return tmp_ele_placeholder;
  }
};
//標記的資料能設定顏色
select_search.prototype.mark_color = function () {};
//打開插件顯示下拉資料
//templateResult 跟  matcher官方插件都有範例
select_search.prototype.call_select = function (next_obj) {
  var select = this;
  var next_obj = next_obj || null;
  //刷新的時候用
  if (next_obj !== null) {
    var system_width = width_calc(next_obj);
    //重新讀的話要先清空
    next_obj.ele.empty();
    next_obj.ele.select2({
      data: next_obj.data,
      // matcher: matchStart,
      language: {
        noResults: function (term) {
          return next_obj.no_results_text;
        },
      },
      width: system_width,
      //結果顯示區
      templateResult: resultState,
      //輸入搜尋框事件 parames是輸入的字 data則是每筆option資料
      matcher: function (params, data) {
        return creat_matcher(params, data, next_obj);
      },
    });
    select.placeholder_color_change(next_obj.ele);
  } else {
    //每個select呼叫plugin時使用
    $.each(select.all_select, function (index, val) {
      var tmp_obj = val;
      var system_width = width_calc(tmp_obj);
      var tmp_ele = tmp_obj.ele;
      var data = val.data;
      //呼叫這個plugin
      tmp_ele.select2({
        data: data,
        //結果顯示區
        templateResult: function (data, container) {
          //找出輸入框
          var search_box = tmp_ele
            .data('select2')
            .$dropdown.find('.select2-search__field');
          //儲存重複的選項
          var new_repeat_arr;
          //搜尋框有直
          if (search_box.val().length > 0) {
            new_repeat_arr = find_repeat_arr(tmp_obj.data);
          }
          if (data.mark !== undefined && data.mark !== null) {
            $(container).addClass(data.mark);
          }
          //拿到link-id 名稱
          var linkId_text = select.find_prev_text(tmp_obj, data.linkId);
          if (new_repeat_arr !== undefined) {
            if (new_repeat_arr.length == 0) {
              return data.text;
            }
            //如果當下DATA符合其中一筆new_repeat_arr資料就是TRUE
            var show_ans = new_repeat_arr.some(function (item, index, array) {
              return item.text == data.text;
            });
            if (show_ans) {
              var $state = $(
                '<span> ' +
                  data.text +
                  '</span><span class="extra-infor show">(' +
                  linkId_text +
                  ')</span>'
              );
            } else {
              var $state = $(
                '<span> ' +
                  data.text +
                  '</span><span class="extra-infor">(' +
                  linkId_text +
                  ')</span>'
              );
            }
            return $state;
          }
          return data.text;
        },
        language: {
          noResults: function () {
            //沒結果顯示的文字
            return val.no_results_text;
          },
        },
        width: system_width,
        matcher: function (params, data) {
          return creat_matcher(params, data, tmp_obj);
        },
      });
      //初始化的時候處理placeholder顏色
      select.placeholder_color_change(tmp_ele);
    });
  }
  //過濾資料顯示
  function resultState(data, container) {
    //找出輸入框
    var search_box = next_obj.ele
      .data('select2')
      .$dropdown.find('.select2-search__field');
    //判斷前面有沒有值
    var tmp_is_prev = select.is_prev_val(next_obj);
    //儲存重複的選項
    var new_repeat_arr;
    //如果搜尋框有值且前面下拉不是def
    if ($.trim(search_box.val()).length > 0 && !tmp_is_prev) {
      //每次進去都先清空搜尋到的arr
      select.search_arr.length = 0;
      var new_search_condition_arr;
      //防呆-額外搜尋條件
      if (next_obj.search_condition_arr == undefined) {
        next_obj.search_condition_arr = [];
      }
      if (next_obj.search_condition_arr.length !== 0) {
        new_search_condition_arr = next_obj.search_condition_arr;
        if (
          new_search_condition_arr.indexOf('id') == -1 &&
          new_search_condition_arr.indexOf('text') == -1
        ) {
          new_search_condition_arr.push('id', 'text');
        }
      } else {
        new_search_condition_arr = ['id', 'text'];
      }
      //額外搜尋條件-帶進來資料的obj data 去跟搜尋框比對回傳找到東西的arr
      //ex:["黑貓", "0007-00010001", "潔西卡"]
      var all_pre_obj = next_obj.data.filter(function (item, index, array) {
        var tmp_new_arr = new_search_condition_arr.map(function (
          val,
          index,
          array
        ) {
          if (item[val] == undefined) {
            item[val] = '';
          }
          return item[val];
        });
        var flag = false;
        //比對搜尋的字串
        $.each(tmp_new_arr, function (indexInArray, val) {
          if (val.indexOf($.trim(search_box.val())) !== -1) {
            flag = true;
          }
        });
        return flag == true;
      });
      //這邊開始抓重複資料
      new_repeat_arr = find_repeat_arr(all_pre_obj);

      select.search_arr = all_pre_obj;

      select.is_search = true;
    } else {
      //前面是DEF
      //如果搜尋框有字才跑群組人員判斷
      if (search_box.val().length > 0) {
        new_repeat_arr = find_repeat_arr(next_obj.data);
      }

      //如果搜尋框沒有值那就是把之前搜尋的清空
      select.search_arr.length = 0;
    }
    //把上面找到資料跟原本資料合併，這邊的原本資料是指如果前面有選那就是帶入前面的linkId去呈現選單
    var tmp_new_arr = select.save_show_arr.concat(select.search_arr);

    //所有的資料都先隱藏
    $(container).addClass('optInvisible');
    $.each(tmp_new_arr, function (index, val) {
      if (data.id == val.id && data.linkId == val.linkId) {
        //將搜尋到的
        $(container).removeClass('optInvisible');
      }
    });
    //離職人員顏色判斷
    if (data.mark !== undefined && data.mark !== null) {
      $(container).addClass(data.mark);
    }
    //拿到link-id 名稱
    var linkId_text = select.find_prev_text(next_obj, data.linkId);
    if (new_repeat_arr !== undefined) {
      if (new_repeat_arr.length == 0) {
        return data.text;
      }
      //如果當下DATA符合其中一筆new_repeat_arr資料就是TRUE
      var show_ans = new_repeat_arr.some(function (item, index, array) {
        return item.text == data.text;
      });

      if (show_ans) {
        var $state = $(
          '<span> ' +
            data.text +
            '</span><span class="extra-infor show">(' +
            linkId_text +
            ')</span>'
        );
      } else {
        var $state = $(
          '<span> ' +
            data.text +
            '</span><span class="extra-infor">(' +
            linkId_text +
            ')</span>'
        );
      }
      return $state;
    }
    return data.text;
  }
  //搜尋功能字串比較
  function creat_matcher(params, data, tmp_obj) {
    var list = tmp_obj.ele.data('select2').$results.parent();
    var tmp_is_prev = select.is_prev_val(tmp_obj);
    //如果是輸入空值
    if ($.trim(params.term) === '') {
      //這邊的功能是如果搜尋框是空值，原本會回傳全部資料，但除了第一個下拉可以顯示選單，其他的必須隱藏下拉
      //這邊的判斷是如果前面是def預設表示不用顯示選單
      if (tmp_obj.sort !== 0 && tmp_is_prev) {
        list.hide();
      }
      return data;
    }
    if (typeof data.text === 'undefined') {
      return null;
    }
    var new_search_condition_arr;
    //額外搜尋條件防呆
    if (tmp_obj.search_condition_arr == undefined) {
      tmp_obj.search_condition_arr = [];
    }
    //如果沒有條件陣列就跑預設ID　跟ＴＥＸＴ
    if (tmp_obj.search_condition_arr.length == 0) {
      new_search_condition_arr = [];
      new_search_condition_arr.push(data.text, data.id);
    } else {
      //將傳進來的額外條件轉換成物件去找值並轉換陣列
      //ex:["cat", "黑貓", "", "業務部-北", "0003"]轉換成這樣
      new_search_condition_arr = tmp_obj.search_condition_arr.map(function (
        item,
        index,
        array
      ) {
        if (data[item] == undefined) {
          data[item] = '';
        }
        return data[item];
      });
      new_search_condition_arr.push(data.text, data.id);
    }
    var modifiedData;
    //搜尋每個額外條件的文字是否有一樣的，有找到就回傳該筆資料
    //ex:["cat", "黑貓", "", "業務部-北", "0003"]我打"黑"就可以找到
    $.each(new_search_condition_arr, function (index, val) {
      if (val.indexOf($.trim(params.term)) > -1) {
        modifiedData = $.extend({}, data, true);
      }
    });
    if (modifiedData !== undefined) {
      return modifiedData;
    }
    // Return `null` if the term should not be displayed
    return null;
  }
  //群組功能-抓重複資料
  function find_repeat_arr(all_arr) {
    var new_repeat_arr = [];
    all_arr.forEach(function (item, index, array) {
      var tmp_resault = findObjectByProporigin(array, 'text', item.text);
      var source_text = item.text;
      //抓過的文字就不要再抓的判斷
      var ans = new_repeat_arr.every(function (item, index, array) {
        return item.text !== source_text;
      });
      if (tmp_resault.length > 1 && ans == true) {
        new_repeat_arr.push(tmp_resault[0]);
      }
    });
    return new_repeat_arr;

    //抓OBJ arr重複資料的function
    function findObjectByProporigin(arr, prop, val) {
      var result = [];
      arr.map(function (el) {
        if (el[prop] === val) {
          result.push(el);
        }
      });
      return result;
    }
  }

  /**
   *系統寬度判斷
   *
   * @param {*} obj
   * @returns
   */
  function width_calc(obj) {
    var prev_placeholder = obj.prev_placeholder;
    var search_placeholder = obj.search_placeholder;
    //先抓元素字形大小
    var system_font_size = parseInt(obj.ele.css('fontSize'));
    //利用placeholder去判斷這個下拉的寬度
    var bigger_placeholder;
    if (
      parseInt(prev_placeholder.length) > parseInt(search_placeholder.length)
    ) {
      bigger_placeholder = prev_placeholder;
    } else {
      bigger_placeholder = search_placeholder;
    }
    //字數乘字形算寬度
    var system_width = system_font_size * bigger_placeholder.length + 50;
    return system_width;
  }
};
//選則後更新自己選單 選擇自己的obj然後帶入自己連連前面的linkID
select_search.prototype.after_select_data = function (current_obj, linkID) {
  var select = this;
  select.call_select(current_obj);
};
//記下當下的選單資料
select_search.prototype.show_current_data = function (current_obj, linkID) {
  var select = this;
  var select_val_linkId = linkID; //帶入的連結資料
  var tmp_arr = current_obj.data.filter(function (element, index, arr) {
    if (element.linkId !== undefined) {
      //選出部門代號相符的資料，以及帶入預設值
      if (select_val_linkId == 'def') {
        //如果是預設就回傳全部資料
        return element.id !== '';
      } else {
        //回傳等於聯結資料和預設placeholder
        return element.linkId == select_val_linkId || element.id === 'def';
      }
    } else {
      //沒定義linkid的話就是第一個因此回傳全部資料
      return element.id !== '';
    }
  });
  //修改完存進陣列在帶入此功能
  select.save_show_arr = tmp_arr;
};

//往前刷新自己的選單並給值給前一個select
//參數為當前的排序，和全部陣列
select_search.prototype.reset_prev_list = function (
  self_sort,
  all_select,
  select_data
) {
  var select = this;
  //找出先前的欄位包掛自己
  var all_pre_obj = all_select.filter(function (item, index, array) {
    return item.sort <= self_sort;
  });
  //目前選到的資訊
  var select_data = select_data;

  //從後面處理因此要反轉陣列
  all_pre_obj.reverse();
  ////先前選單第一個選單有值後往前推選單資料，處理先前的選單
  $.each(all_pre_obj, function (index, val) {
    //先前陣列的當前obj
    var current_pre_obj = val;
    //先前陣列的當前ele 的val
    var current_pre_value = current_pre_obj.ele.val();
    //如果是搜尋的話可能會帶入初始進來，因此要禁止
    if (current_pre_value == 'def') {
      return;
    }
    //找出當下的likId
    var linkId;
    if (index == 0) {
      linkId = select_data.linkId;
    } else {
      linkId = select.find_linkId(current_pre_obj, current_pre_value);
    }
    // console.warn(
    //   'arr',
    //   all_pre_obj,
    //   current_pre_obj.ele,
    //   current_pre_obj,
    //   current_pre_value,
    //   linkId,
    //   all_select[index + 1]
    // );

    //往前刷新選單
    //選單要重製的話要先清空在重新讀取回傳的新選單再給值

    select.after_select_placeholder_change(current_pre_obj, current_pre_value);

    select.after_select_data(current_pre_obj, linkId);
    //自己的欄位重新給值
    current_pre_obj.ele.val(current_pre_value).trigger('change.select2');

    //最後一個就不用，利用陣列長度去判斷
    if (index + 1 < all_pre_obj.length) {
      select.after_select_data(all_pre_obj[index + 1], 'def'); //先重製在重讀
      all_pre_obj[index + 1].ele.val(linkId).trigger('change.select2');
    }
    select.placeholder_color_change(current_pre_obj.ele);
  });
};
//找出當下元素的link id
//參數為當前的obj和當前的下拉vlaue
select_search.prototype.find_linkId = function (obj, target) {
  var tmp_linkId;
  $.each(obj.data, function (index, val) {
    if (val.id == target) {
      tmp_linkId = val.linkId;
    }
  });
  return tmp_linkId;
};
//判斷前一個元素是否為預設
select_search.prototype.is_prev_val = function (obj) {
  var select = this;
  var all_select = select.all_select;
  var tmp_prev_obj = all_select.filter(function (item, index, array) {
    return item.sort == parseInt(obj.sort) - 1;
  });
  if (tmp_prev_obj.length > 0) {
    if (tmp_prev_obj[0].ele.val() == 'def') {
      return true;
    } else {
      return false;
    }
  }
};
//找前一個元素的名字
select_search.prototype.find_prev_text = function (obj, linkId) {
  var select = this;
  var target_id = linkId || 'def';

  var all_select = select.all_select;
  var tmp_prev_obj = all_select.filter(function (item, index, array) {
    return item.sort == parseInt(obj.sort) - 1;
  });
  if (tmp_prev_obj.length > 0) {
    // if (tmp_prev_obj[0].ele.val() == 'def') {
    //   return true;
    // } else {
    //   return false;
    // }
    var linkId_text = tmp_prev_obj[0].data.filter(function (
      item,
      index,
      array
    ) {
      return item.id == target_id;
    });
    return linkId_text[0].text;
  }
};
//重製所有選單
select_search.prototype.reset_all_list = function () {
  var select = this;
  var all_select = select.all_select;
  $.each(all_select, function (index, val) {
    val.ele.empty();
    select.after_select_placeholder_change(val, 'def');
    select.after_select_data(val, 'def');
  });
};
//重製自己後面的所有選單
select_search.prototype.reset_after_my_ele = function (tmp_current_obj) {
  var select = this;
  all_select = select.all_select;
  //找出所有後面的選單資料
  var after_obj_arr = all_select.filter(function (item, index, array) {
    return item.sort > tmp_current_obj.sort;
  });
  $.each(after_obj_arr, function (index, val) {
    val.ele.empty();
    select.after_select_placeholder_change(val, 'def');
    select.after_select_data(val, 'def');
    select.placeholder_color_change(val.ele);
  });
};
//選擇後刷新placeholder文字
select_search.prototype.after_select_placeholder_change = function (
  current_obj,
  val
) {
  var select = this;
  var all_select = select.all_select;
  var current_obj = current_obj;
  var sort = current_obj.sort;
  var current_data = current_obj.data[0];
  var tmp_is_prev = select.is_prev_val(current_obj);
  var tmp_arr = all_select.filter(function (item, index, array) {
    return item.sort > sort;
  });
  if (val !== 'def') {
    current_data.text = current_data.after_select_placeholder;
  } else {
    current_data.text = current_data.before_select_placeholder;
    if (sort !== 0) {
      if (!tmp_is_prev) {
        //如果前面不是def
        current_data.text = current_data.after_select_placeholder;
      }
    }
  }
};
//placeholder文字顏色判斷
select_search.prototype.placeholder_color_change = function (ele) {
  var tmp_ele = ele;
  var render_text = tmp_ele
    .data('select2')
    .$selection.find('.select2-selection__rendered');
  //如果選到def 預設選項顏色要給灰
  if (tmp_ele.val() == 'def') {
    render_text.css('color', '#808080');
  } else {
    render_text.css('color', '');
  }
};
/**
 *
 *
 * @param {*} data_params_arr 原始資料
 *
 */
function set_select_search(data_params_arr) {
  var new_select_search = new select_search(data_params_arr);
  //資料處理
  new_select_search.data_process();
  //讓select都綁上plugin
  new_select_search.call_select();
  //所有下拉
  var all_select = new_select_search.all_select;
  //取得第一個元素
  var first_obj = all_select.filter(function (item, index, array) {
    return item.sort == 0;
  });
  //第一個元素
  var first_ele = first_obj[0].ele;
  //取得最後一個元素
  var last_obj = all_select.filter(function (item, index, array) {
    return item.sort + 1 == all_select.length;
  });
  //將最後一個元素存進去
  new_select_search.last_ele = last_obj[0].ele;
  //所有事件
  $.each(all_select, function (index, val) {
    var tmp_current_obj = val;
    var tmp_ele = val.ele;
    //自身排序
    var self_sort = tmp_current_obj.sort;
    //找出隔壁的元素
    var next_obj = all_select.filter(function (item, index, array) {
      return item.sort == self_sort + 1;
    });
    //選擇的時候
    tmp_ele.on('select2:select', function (e) {
      var select_data;
      if (e.params == undefined) {
        var arr_select_data = tmp_current_obj.data.filter(function (
          item,
          index,
          array
        ) {
          return item.id == tmp_ele.val();
        });
        select_data = arr_select_data[0];
      } else {
        select_data = e.params.data;
      }

      //事件規則-
      ////如果從左邊依序選到右邊，只需使用連動選擇後往後更新選單(多層)的這個function-after_filter_all_data
      ////如果從中間開始挑(含最後一個)就要顧慮前面的選單資料reset_prev_list，跟後面的選單資料after_filter_all_data
      var is_search = new_select_search.is_search;
      //判斷前面是不是預設def
      var tmp_is_prev = new_select_search.is_prev_val(tmp_current_obj);
      // console.warn(
      //   '--',
      //   first_ele.val(),
      //   first_ele.val() !== 'def' && !tmp_is_prev && is_search == false,
      //   tmp_is_prev,
      //   val.sort,
      //   is_search
      // );
      //條件:進來的可能不是第1個可能是第2個或第3個但確保前面都有數值(第一個不是預設DEF和前面的下拉不是DEF以及"沒使用搜尋")或我目前點的是第一個下拉(可以搜尋、點擊皆可)
      if (
        (first_ele.val() !== 'def' && !tmp_is_prev && is_search == false) ||
        val.sort == 0
      ) {
        //不能是最後一個元素，找出隔壁元素，如果沒有就是最後一個
        if (next_obj.length !== 0) {
          //1、2、3、4 如果我從2開始選3跟4都要重製
          //重製自己後面的所有選單，因為使用者可能已經全部選過一輪
          new_select_search.reset_after_my_ele(tmp_current_obj);
          //後面的下拉資料帶入
          new_select_search.after_select_data(next_obj[0], tmp_ele.val());
        }
      } else {
        //條件:1、2、3、4都沒有值我從中間(除了第一個)下拉做操作(從中間做搜尋操作)或是前面都有值，在接下來的下拉做搜尋操作也會進來

        //如果從中間開始選，例如:如果從3開始就要刷新1、2
        //往前刷新選單
        new_select_search.reset_prev_list(self_sort, all_select, select_data);
        //刷新後面例如:從2開始要處理2後面的下拉
        //處理後面的選單
        new_select_search.reset_after_my_ele(tmp_current_obj);
      }
      //選完如果有使用搜尋框功能，選完要把她關掉
      new_select_search.is_search = false;
      //placeholder顏色處理
      new_select_search.placeholder_color_change(tmp_ele);
    });
    //打開時
    tmp_ele.on('select2:open', function (e) {
      //判斷前面有沒有值
      var tmp_is_prev = new_select_search.is_prev_val(tmp_current_obj);
      var dropdown = $(this)
        .data('select2')
        .$dropdown.find('.select2-search--dropdown');
      //找出輸入框
      var search_box = tmp_current_obj.ele
        .data('select2')
        .$dropdown.find('.select2-search__field');
      //打開時要判斷選單顯示
      if (tmp_is_prev) {
        var data = e.params.data;
        // 打開如果是預設
        //由於一次只會顯示一個選單，因此直接選
        //預設不顯示資料只開放搜尋
        var list_ele = $(this)
          .data('select2')
          .$dropdown.find('.select2-results');
        //預設下拉不顯示
        list_ele.css('display', 'none');
        dropdown.on('keyup', search_box, function (e) {
          var list_ele_children = tmp_ele
            .data('select2')
            .$dropdown.find('.select2-results__options')
            .children();
          if (list_ele_children.length > 0 && search_box.val() !== '') {
            //如果有資料再顯示
            list_ele.css('display', '');
          } else {
            list_ele.css('display', 'none');
          }
        });
      }
      if (index !== 0) {
        //記下當下的資料
        new_select_search.show_current_data(
          tmp_current_obj,
          all_select[index - 1].ele.val()
        );
      } else {
        new_select_search.show_current_data(tmp_current_obj, 'def');
      }

      //假的placeholder處理
      var hint_html =
        '<span class="hint">' + val.search_placeholder + '</span>';
      //假placeholder文字
      //包裝搜尋框的ele
      var hint = $(this).data('select2').$dropdown.find('.hint');
      var dropdown = $(this)
        .data('select2')
        .$dropdown.find('.select2-search--dropdown');
      var search_box = $(this)
        .data('select2')
        .$dropdown.find('.select2-search__field');
      //判斷有沒有假placeholder的class，沒有的話就新增一個
      if (hint.length > 0) {
        hint.text(val.search_placeholder);
      } else {
        dropdown.append(hint_html);
        hint = dropdown.find('.hint');
      }
      //預設打開一定顯示
      hint.show();
      //點假的placeholder還是要觸發input焦點
      hint.on({
        click: function () {
          search_box.focus();
        },
      });
      dropdown.on('keyup', search_box, function (e) {
        is_show(search_box);
      });
      //判斷plceholder顯示
      function is_show(search_box) {
        var tmp_val = search_box.val();
        if (tmp_val.length > 0) {
          hint.hide();
        } else {
          hint.show();
        }
      }
    });
  }); // Select the option with a value of '1'
}
//預設值
(function ($) {
  $.fn.set_select_search_def_val = function (val) {
    if (val !== '') {
      this.val(val).trigger('change').trigger('select2:select');
    }
  };
})(jQuery);
//帶入自訂值
(function ($) {
  $.fn.set_select_search_add_option = function (id, text) {
    var id = id;
    var text = text;
    if (id == '') {
      id = 'null';
    }
    if (text == '') {
      text = ' ';
    }
    var data = {
      id: id,
      text: text,
    };
    var select = this;
    setTimeout(function () {
      select.append(
        "<option value='" + data.id + "' selected>" + data.text + '</option>'
      );
      select.trigger('change');
    }, 0);
  };
})(jQuery);
//封裝插件
(function ($) {
  var methods = {
    init: function (options) {
      //判斷存資料的Input存在是否 false就是不存在
      var data_flag = true;
      //下拉存在防呆判斷
      options.ele_id_arr.forEach(function (item, index, array) {
        var select = $('#' + item);
        if (select.length == 0) {
          console.warn('其中的select不存在，請檢查select id');
          data_flag = false;
        }
      });

      //資料parse出來去判斷
      options.data_arr = options.data_arr.map(function (item, index, array) {
        var input = $('#' + item);
        if (input.length == 0) {
          console.warn('其中的input不存在，請檢查input id');
          data_flag = false;
          return false;
        }
        //如果是空值
        if (input.val() == '' || input.val() == undefined) {
          console.warn('請檢查input資料');
          data_flag = false;
          return false;
        }
        //資料有錯的話就會像這樣 [Array(4), false, Array(10), Array(13)]
        return JSON.parse(input.val());
      });
      //有一個不存在就跳出
      if (data_flag == false) {
        return false;
      }
      //元素跟資料數量和格式一定要依樣才給跑
      if (
        options.ele_id_arr.length !== options.data_arr.length ||
        options.ele_id_arr.length !== options.format_arr.length ||
        options.data_arr.length !== options.format_arr.length
      ) {
        console.warn('呼叫格式數量有誤');
        return false;
      }
      //資料處理
      var data_params_arr = options.ele_id_arr.map(function (
        item,
        index,
        array
      ) {
        var tmp_obj = {
          ele_id: item,
          data: options.data_arr[index], //json資料
          search_condition_arr: options.extra_search_condition_arr[index], //多的搜尋條件欄位
          format: options.format_arr[index],
        };
        return tmp_obj;
      });
      set_select_search(data_params_arr);
    },
    //關閉
    close: function () {},
  };

  $.fn.setSelectSearch = function (method) {
    // Method calling logic
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === 'object' || !method) {
      //如果是帶有參數
      return methods.init.apply(this, arguments);
    } else {
      $.error('找不到此方法');
    }
  };
})(jQuery);
