var json = {
    email: "9just.k.on@gmail.com",
    home: '大围名城',
    home_case: [
        { mapName: '大圍街市', cases: [
                {caseID:1233,"start_date":"2020-06-24","end_date":"2020-06-24"}
            ]},
        { mapName: '美田邨購物商場', cases: [
                {caseID:1233,"start_date":"2020-06-25","end_date":"2020-06-25"}
            ]}
    ],
    work: '香港城市大学',
    work_case: [],
    fav_places: {
        '0': { mapName: '又一城', flag: false, cases: [] },
        '1': { mapName: '朗豪坊', flag: false, cases: [] },
        '2': { mapName: '西九龙中心', flag: true, cases: [
                {caseID:1233,"start_date":"2020-06-24","end_date":"2020-06-24"},
                {caseID:1263,"start_date":"2020-06-24","end_date":"2020-06-24"}
            ]}
    },
    vis_places: {
        '0': { mapName: '新城市廣場', vis_date:"2020-06-26", flag: true, cases: [
                {caseID:1233,"start_date":"2020-06-26","end_date":"2020-06-26"}
            ] },
        '1': { mapName: '新城市廣場', vis_date:"2020-07-03", flag: false, cases: [] },
        '2': { mapName: '香港科技大学', vis_date:"2020-07-05", flag: false, cases: [] }
    }
}
module.exports.json = json;
