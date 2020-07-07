var json = {
    email: "user_email",
    home: '香港大學',
    home_case: [
        { mapName: '香港大學', cases: [
                {caseID:1,"start-date":"2020-07-01","end_date":"2020-07-15"},
                {caseID:10,"start-date":"2020-07-02","end_date":"2020-07-16"}
            ]},
        { mapName: 'Wellcome', cases: [
                {caseID:12,"start-date":"2020-07-01","end_date":"2020-07-15"},
                {caseID:18,"start-date":"2020-07-01","end_date":"2020-07-15"}
            ]}
    ],
    work: '香港大學',
    work_case: [
        { mapName: '香港大學', cases: [
                {caseID:80,"start-date":"2020-07-01","end_date":"2020-07-15"},
                {caseID:12,"start-date":"2020-07-02","end_date":"2020-07-16"}
                ]},
    ],
    fav_places: {
        '0': { mapName: '香港大學', flag: false, cases: [] },
        '1': { mapName: '7-11 便利店', flag: false, cases: [] },
        '2': { mapName: 'Wellcome', flag: true, cases: [
                {caseID:90,"start-date":"2020-07-01","end_date":"2020-07-15"}
            ]}
    },
    vis_places: {
        '0': { mapName: '香港大學', flag: false, cases: [] }}
}
module.exports.json = json;
