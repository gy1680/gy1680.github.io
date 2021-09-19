const data = {
    "CHR": [
        {"judge": "Hell", "grade": 0},
        {"min":1, "judge": "Torture", "grade": 0},
        {"min":2, "judge": "Not Good", "grade": 0},
        {"min":4, "judge": "Good", "grade": 0},
        {"min":7, "judge": "Excellent", "grade": 1},
        {"min":9, "judge": "Excellent+", "grade": 2},
        {"min":11, "judge": "Unbelievable", "grade": 3},
    ],
    "MNY": [
        {"judge": "Hell", "grade": 0},
        {"min":1, "judge": "Torture", "grade": 0},
        {"min":2, "judge": "Not Good", "grade": 0},
        {"min":4, "judge": "Good", "grade": 0},
        {"min":7, "judge": "Excellent", "grade": 1},
        {"min":9, "judge": "Excellent+", "grade": 2},
        {"min":11, "judge": "Unbelievable", "grade": 3},
    ],
    "SPR": [
        {"judge": "Hell", "grade": 0},
        {"min":1, "judge": "Torture", "grade": 0},
        {"min":2, "judge": "Unlucky", "grade": 0},
        {"min":4, "judge": "Good", "grade": 0},
        {"min":7, "judge": "Blessed", "grade": 1},
        {"min":9, "judge": "Bliss", "grade": 2},
        {"min":11, "judge": "Destiny", "grade": 3},
    ],
    "INT": [
        {"judge": "Hell", "grade": 0},
        {"min":1, "judge": "Torture", "grade": 0},
        {"min":2, "judge": "Not Good", "grade": 0},
        {"min":4, "judge": "Good", "grade": 0},
        {"min":7, "judge": "Excellent", "grade": 1},
        {"min":9, "judge": "Excellent+", "grade": 2},
        {"min":11, "judge": "Unbelievable ", "grade": 3},
        {"min":21, "judge": "Widen", "grade": 3},
        {"min":131, "judge": "Soul", "grade": 3},
        {"min":501, "judge": "Spirit", "grade": 3},
    ],
    "STR": [
        {"judge": "Hell", "grade": 0},
        {"min":1, "judge": "Torture", "grade": 0},
        {"min":2, "judge": "Not Good", "grade": 0},
        {"min":4, "judge": "Good", "grade": 0},
        {"min":7, "judge": "Excellent", "grade": 1},
        {"min":9, "judge": "Excellent+", "grade": 2},
        {"min":11, "judge": "Unbelievable ", "grade": 3},
        {"min":21, "judge": "Breath", "grade": 3},
        {"min":101, "judge": "Foundation", "grade": 3},
        {"min":401, "judge": "Core", "grade": 3},
        {"min":1001, "judge": "Spirit Baby", "grade": 3},
        {"min":2001, "judge": "Spirit Body", "grade": 3},
    ],
    "AGE": [
        {"judge": "Die in womb", "grade": 0},
        {"min":1, "judge": "Die at young age", "grade": 0},
        {"min":10, "judge": "Teenager", "grade": 0},
        {"min":18, "judge": "20-35", "grade": 0},
        {"min":40, "judge": "Middle age", "grade": 0},
        {"min":60, "judge": "Retired", "grade": 1},
        {"min":70, "judge": "Senior", "grade": 1},
        {"min":80, "judge": "Golden age", "grade": 2},
        {"min":90, "judge": "Longliving", "grade": 2},
        {"min":95, "judge": "Young forever", "grade": 3},
        {"min":100, "judge": "Immortal", "grade": 3},
        {"min":500, "judge": "Eternal", "grade": 3},
    ],
    "SUM": [
        {"judge": "Hell", "grade": 0},
        {"min":41, "judge": "Torture", "grade": 0},
        {"min":50, "judge": "Not Good", "grade": 0},
        {"min":60, "judge": "Good", "grade": 0},
        {"min":80, "judge": "Excellent", "grade": 1},
        {"min":100, "judge": "Excellent+", "grade": 2},
        {"min":110, "judge": "Unbelievable ", "grade": 3},
        {"min":120, "judge": "Legend", "grade": 3},
    ]
}

function summary(type, value) {
    let length = data[type].length;
    while(length--) {
        const {min, judge, grade} = data[type][length];
        if(min==void 0 || value >= min) return {judge, grade};
    }
}

export { summary };