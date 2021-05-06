$(document).ready(function () {
  //測試用
  var area_data = [
    {
      area_id: '001',
      area_name: '北',
      linkId: null,
    },
    {
      area_id: '002',
      area_name: '中',
      linkId: null,
    },
    {
      area_id: '003',
      area_name: '南',
      linkId: null,
    },
    {
      area_id: '004',
      area_name: '國外',
      linkId: null,
      disabled: true,
    },
  ];
  var depart_data = [
    {
      dp_id: '0001',
      dp_name: '經理室',
      linkId: '001',
    },
    {
      dp_id: '0002',
      dp_name: '企劃部',
      linkId: '002',
    },
    {
      dp_id: '0003',
      dp_name: '系統部',
      linkId: '003',
    },
    {
      dp_id: '9999',
      dp_name: '群組1',
      linkId: '003',
    },
    {
      dp_id: '0004',
      dp_name: '停用部門',
      linkId: '001',
      disabled: true,
    },
  ];
  var ep_data = [
    {
      ep_id: '00001',
      ep_name: '經理室-小明',
      linkId: '0001',
    },
    {
      ep_id: '00002',
      ep_name: '企劃部-曉華',
      linkId: '0002',
    },
    {
      ep_id: '00003',
      ep_name: '系統部-小珍',
      linkId: '0003',
    },
    {
      ep_id: '00004',
      ep_name: '系統部-小為(離職)',
      linkId: '0003',
      mark: 'def_mark',
    },
    {
      ep_id: '999900003',
      ep_name: '系統部-小珍',
      linkId: '9999',
    },
    {
      ep_id: '00005',
      ep_name: '系統部-小瑞',
      linkId: '0003',
      english_name: 'ann',
      tall: '170',
    },
    {
      ep_id: '00006',
      ep_name: '系統部-小文(離職)',
      linkId: '0003',
      english_name: 'wun',
      tall: '180',
      mark: 'def_mark',
      disabled: true,
    },
  ];
  var four_data = [
    {
      data_id: '000001',
      data_name: '經理室-小明-桌子',
      linkId: '00001',
    },
    {
      data_id: '000002',
      data_name: '企劃部-曉華-椅子',
      linkId: '00002',
    },
    {
      data_id: '000003',
      data_name: '系統部-小珍-電腦',
      linkId: '00003',
    },
    {
      data_id: '000004',
      data_name: '系統部-小為(離職)-鍵盤',
      linkId: '00004',
    },
  ];
  var five_data = [
    {
      data_id: '01',
      data_name: '經理室-小明-桌子',
      linkId: null,
    },
    {
      data_id: '02',
      data_name: '企劃部-曉華-椅子',
      linkId: null,
    },
    {
      data_id: '03',
      data_name: '系統部-小珍-電腦',
      linkId: null,
    },
    {
      data_id: '04',
      data_name: '系統部-小為(離職)-鍵盤',
      linkId: null,
    },
  ];

  $('#area_input').val(JSON.stringify(area_data));
  $('#depart_input').val(JSON.stringify(depart_data));
  $('#ep_input').val(JSON.stringify(ep_data));
  $('#tool_input').val(JSON.stringify(four_data));

  $('#test_input').val(JSON.stringify(five_data));

  //下拉模糊搜尋JS呼叫方法
  //上方範例是三組下拉，因此以下內容都是三組
  $(document).setSelectSearch({
    ele_id_arr: ['area', 'depart', 'people', 'tool'], //依序填入下拉的id
    data_arr: ['area_input', 'depart_input', 'ep_input', 'tool_input'], //依序填入存入下拉資料的input id
    format_arr: [
      //依序填入下拉資料格式 的欄位名稱
      //地區的資料所以去上面PHP陣列的欄位資料填上去
      {
        select_id: 'area_id', //下拉資料的ID
        select_text: 'area_name', //下拉資料的的文字
        linkId: 'linkId', //連結欄位
        disabled: 'disabled',
      },
      //部門的資料所以去上面PHP陣列的欄位資料填上去
      {
        select_id: 'dp_id', //下拉資料的ID
        select_text: 'dp_name', //下拉資料的的文字
        linkId: 'linkId', //連結欄位
        disabled: 'disabled',
      },
      //人員的資料所以去上面PHP陣列的欄位資料填上去，此外資料有設定離職人員反灰，因此需加入mark欄位
      {
        select_id: 'ep_id', //下拉資料的ID
        select_text: 'ep_name', //下拉資料的的文字
        linkId: 'linkId', //連結欄位
        mark: 'mark', //預設離職人員欄位標記資料有出現mark才需要加入
        disabled: 'disabled',
      },
      {
        select_id: 'data_id', //下拉資料的ID
        select_text: 'data_name', //下拉資料的的文字
        linkId: 'linkId', //連結欄位
        mark: 'mark', //預設離職人員欄位標記資料有出現mark才需要加入
        disabled: 'disabled',
      },
    ],
    //額外條件搜尋功能功能
    extra_search_condition_arr: [
      [], //地區沒設定因此是空
      [], //部門沒設定因此是空
      ['english_name', 'tall', 'country'], //人員資料有設定english、tall、country三個關鍵字因此在該順序加入三個關鍵字
    ],
    //額外條件搜尋功能功能範例
    // extra_search_condition_arr: [
    //   //額外的搜尋欄位名稱依順序排列，如果中間沒有就填上空陣列"[]"
    //   //如果後面都沒有額外搜尋條件則可不填
    //   ['con1', 'con2'],//第一個下拉
    //   ['pon1', 'pon2', 'pon3'],//第二個下拉
    //   [],//第三個下拉
    //   ['pon1']//第四個下拉
    // ],
  });
  $(document).setSelectSearch({
    ele_id_arr: ['test'], //依序填入下拉的id
    data_arr: ['test_input'], //依序填入存入下拉資料的input id
    format_arr: [
      //依序填入下拉資料格式 的欄位名稱
      //地區的資料所以去上面PHP陣列的欄位資料填上去
      {
        select_id: 'data_id', //下拉資料的ID
        select_text: 'data_name', //下拉資料的的文字
        linkId: 'linkId', //連結欄位
        disabled: 'disabled',
      },
    ],
    //額外條件搜尋功能功能
    extra_search_condition_arr: [],
    //額外條件搜尋功能功能範例
    // extra_search_condition_arr: [
    //   //額外的搜尋欄位名稱依順序排列，如果中間沒有就填上空陣列"[]"
    //   //如果後面都沒有額外搜尋條件則可不填
    //   ['con1', 'con2'],//第一個下拉
    //   ['pon1', 'pon2', 'pon3'],//第二個下拉
    //   [],//第三個下拉
    //   ['pon1']//第四個下拉
    // ],
  });
  //預設值
  // $('#area').setSelectSearch('setDefVal','001');
  // $('#depart').setSelectSearch('setDefVal', '0001');
  $('#tool').setSelectSearch('setDefVal', '000001');

  // $('#area').select2({ width: '300px' });
  // $('#test').setSelectSearch('setDefVal', '01');
});