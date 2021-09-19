import { summary } from './functions/summary.js';
import { getRate, getGrade } from './functions/addition.js';
import Life from './life.js';

class App{
    constructor(){
        this.#life = new Life();
    }

    #life;
    #pages;
    #currentPage;
    #talentSelected = new Set();
    #totalMax=20;
    #isEnd = false;
    #selectedExtendTalent = null;
    #hintTimeout;
    #specialthanks;
    #autoTrajectory;

    async initial() {
        this.initPages();
        this.switch('loading');
        const [,specialthanks] = await Promise.all([
            this.#life.initial(),
            json('specialthanks')
        ]);
        this.#specialthanks = specialthanks;
        this.switch('index');
        globalThis.onerror = (event, source, lineno, colno, error) => {
            this.hint(`[ERROR] at (${source}:${lineno}:${colno})\n\n${error?.stack||error||'unknow Error'}`, 'error');
        }
        const keyDownCallback = (keyboardEvent) => {
            if (keyboardEvent.which === 13 || keyboardEvent.keyCode === 13) {
                const pressEnterFunc = this.#pages[this.#currentPage]?.pressEnter;
                pressEnterFunc && typeof pressEnterFunc === 'function' && pressEnterFunc();
            }
        }
        globalThis.removeEventListener('keydown', keyDownCallback);
        globalThis.addEventListener('keydown', keyDownCallback);
    }

    initPages() {

        // Loading
        const loadingPage = $(`
        <div id="main">
            <div id="title">
                Reset Life<br>
                <div style="font-size:1.5rem; font-weight:normal;">Loading your life...</div>
            </div>
        </div>
        `);

        // Index
        const indexPage = $(`
        <div id="main">
 
            <div id="title">
                Reset Life<br>
                <div style="font-size:1.5rem; font-weight:normal;">Life sucks, get me a new one</div>
            </div>
            <button id="restart" class="mainbtn"><span class="iconfont">&#xe6a7;</span>Reset Now</button>
        
        </div>
        `);

        // Init theme
        this.setTheme(localStorage.getItem('theme'))

        indexPage
            .find('#restart')
            .click(()=>this.switch('talent'));

        indexPage
            .find('#achievement')
            .click(()=>this.switch('achievement'));

        if(localStorage.getItem('theme') == 'light') {
            indexPage.find('#themeToggleBtn').text('Dark Mode')
        } else{
            indexPage.find('#themeToggleBtn').text('Light Mode')
        }

        indexPage
            .find("#themeToggleBtn")
            .click(() => {
                if(localStorage.getItem('theme') == 'light') {
                    localStorage.setItem('theme', 'dark');
                    indexPage.find('#themeToggleBtn').text('Light Mode')
                } else {
                    localStorage.setItem('theme', 'light');
                    indexPage.find('#themeToggleBtn').text('Dark Mode')
                }

                this.setTheme(localStorage.getItem('theme'))
            });

        indexPage
            .find('#specialthanks')
            .click(()=>this.switch('specialthanks'));

        const specialThanksPage = $(`
        <div id="main">
            <button id="specialthanks">Back</button>
            <div id="spthx">
                <ul class="g1"></ul>
                <ul class="g2"></ul>
            </div>
            <button class="sponsor" onclick="globalThis.open('https://afdian.net/@LifeRestart')" style="background: linear-gradient(90deg,#946ce6,#7e5fd9); left:auto; right:50%; transform: translate(-2rem,-50%);">打赏策划(爱发电)</button>
            <button class="sponsor" onclick="globalThis.open('https://dun.mianbaoduo.com/@vickscarlet')" style="background-color:#c69; left:50%; right:auto; transform: translate(2rem,-50%);">打赏程序(顿顿饭)</button>
        </div>
        `);

        specialThanksPage
            .find('#specialthanks')
            .click(()=>this.switch('index'));

        const achievementPage = $(`
        <div id="main">
            <button id="specialthanks">Back</button>
            <span class="title">Stats</span>
            <ul id="total"></ul>
            <span style="padding:0.25rem; margin: 0.5rem 0; border: none; background: #ccc;"></span>
            <span class="title">Achievements<button id="rank">Ranking</button></span>
            <ul id="achievements"></ul>
        `)

        achievementPage
            .find('#specialthanks')
            .click(()=>this.switch('index'));

        achievementPage
            .find('#rank')
            .click(()=>this.hint('Why you need a ranking for life?'));
        // Talent
        const talentPage = $(`
        <div id="main">
            <div class="head" style="font-size: 1.6rem">Pick a Talent</div>
            <button id="random" class="mainbtn" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"">10 Picks！</button>
            <ul id="talents" class="selectlist"></ul>
            <button id="next" class="mainbtn">Please select 3</button>
        </div>
        `);

        const createTalent = ({ grade, name, description }) => {
            return $(`<li class="grade${grade}b">${name}（${description}）</li>`)
        };

        talentPage
            .find('#random')
            .click(()=>{
                talentPage.find('#random').hide();
                const ul = talentPage.find('#talents');
                this.#life.talentRandom()
                    .forEach(talent=>{
                        const li = createTalent(talent);
                        ul.append(li);
                        li.click(()=>{
                            if(li.hasClass('selected')) {
                                li.removeClass('selected')
                                this.#talentSelected.delete(talent);
                                if(this.#talentSelected.size<3) {
                                    talentPage.find('#next').text('Please select 3')
                                }
                            } else {
                                if(this.#talentSelected.size==3) {
                                    this.hint('Please select 3 Talents');
                                    return;
                                }

                                const exclusive = this.#life.exclusive(
                                    Array.from(this.#talentSelected).map(({id})=>id),
                                    talent.id
                                );
                                if(exclusive != null) {
                                    for(const { name, id } of this.#talentSelected) {
                                        if(id == exclusive) {
                                            this.hint(`This one is conflict with【${name}】`);
                                            return;
                                        }
                                    }
                                    return;
                                }
                                li.addClass('selected');
                                this.#talentSelected.add(talent);
                                if(this.#talentSelected.size==3) {
                                    talentPage.find('#next').text('Start my new life')
                                }
                            }
                        });
                    });
                talentPage.find('#next').show()
            });

        talentPage
            .find('#next')
            .click(()=>{
                if(this.#talentSelected.size!=3) {
                    this.hint('Please select 3 Talents');
                    return;
                }
                talentPage.find('#next').hide()
                this.#totalMax = 20 + this.#life.getTalentAllocationAddition(Array.from(this.#talentSelected).map(({id})=>id));
                this.switch('property');
            })

        // Property
        // hint of extension tobermory.es6-string-html
        const propertyPage = $(/*html*/`
        <div id="main">
            <div class="head" style="font-size: 1.6rem">
                <div>Assign points to start the life</div>
                <div id="total" style="font-size:1rem; font-weight:normal;">Points you can use：0</div>
            </div>
            <ul id="propertyAllocation" class="propinitial"></ul>
            <ul class="selectlist" id="talentSelectedView"></ul>
            <div class="btn-area">
                <button id="random" class="mainbtn">Help me assign</button>
                <button id="start" class="mainbtn">Start my new life</button>
            </div>
        </div>
        `);
        propertyPage.mounted = ()=>{
            propertyPage
            .find('#talentSelectedView').append(
                `<li>Picked Talents</li>` +
                Array.from(this.#talentSelected)
                .map(({name,description})=>`<li class="grade0b">${name}(${description})</li>`)
                .join('')
            )
        }
        const groups = {};
        const total = ()=>{
            let t = 0;
            for(const type in groups)
                t += groups[type].get();
            return t;
        }
        const freshTotal = ()=>{
            propertyPage.find('#total').text(`Points you can use：${this.#totalMax - total()}`);
        }
        const getBtnGroups = (name, min, max)=>{
            const group = $(`<li>${name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>`);
            const btnSub = $(`<span class="iconfont propbtn">&#xe6a5;</span>`);
            const inputBox = $(`<input value="0">`);
            const btnAdd = $(`<span class="iconfont propbtn">&#xe6a6;</span>`);
            group.append(btnSub);
            group.append(inputBox);
            group.append(btnAdd);

            const limit = v=>{
                v = Number(v)||0;
                v = Math.round(v);
                return v < min ? min : (
                    v > max ? max : v
                )
            }
            const get = ()=>Number(inputBox.val());
            const set = v=>{
                inputBox.val(limit(v));
                freshTotal();
            }
            btnAdd.click(()=>{
                if(total() >= this.#totalMax) {
                    this.hint('No more points');
                    return;
                }
                set(get()+1);
            });
            btnSub.click(()=>set(get()-1));
            inputBox.on('input', ()=>{
                const t = total();
                let val = get();
                if(t > this.#totalMax) {
                    val -= t - this.#totalMax;
                }
                val = limit(val);
                if(val != inputBox.val()) {
                    set(val);
                }
                freshTotal();
            });
            return {group, get, set};
        }

        groups.CHR = getBtnGroups("Appearance", 0, 10); // 颜值 charm CHR
        groups.INT = getBtnGroups("Intelligence", 0, 10); // 智力 intelligence INT
        groups.STR = getBtnGroups("Health", 0, 10); // 体质 strength STR
        groups.MNY = getBtnGroups("Family Wealth", 0, 10); // 家境 money MNY

        const ul = propertyPage.find('#propertyAllocation');

        for(const type in groups) {
            ul.append(groups[type].group);
        }

        propertyPage
            .find('#random')
            .click(()=>{
                let t = this.#totalMax;
                const arr = [10, 10, 10, 10];
                while(t>0) {
                    const sub = Math.round(Math.random() * (Math.min(t, 10) - 1)) + 1;
                    while(true) {
                        const select = Math.floor(Math.random() * 4) % 4;
                        if(arr[select] - sub <0) continue;
                        arr[select] -= sub;
                        t -= sub;
                        break;
                    }
                }
                groups.CHR.set(10 - arr[0]);
                groups.INT.set(10 - arr[1]);
                groups.STR.set(10 - arr[2]);
                groups.MNY.set(10 - arr[3]);
            });

        propertyPage
            .find('#start')
            .click(()=>{
                if(total() < this.#totalMax) {
                    this.hint(`You still have ${this.#totalMax-total()}points need to assign`);
                    return;
                } else if (total() > this.#totalMax) {
                    this.hint(`You assigned ${total() - this.#totalMax}points more than the limit`);
                    return;
                }
                const contents = this.#life.restart({
                    CHR: groups.CHR.get(),
                    INT: groups.INT.get(),
                    STR: groups.STR.get(),
                    MNY: groups.MNY.get(),
                    SPR: 5,
                    TLT: Array.from(this.#talentSelected).map(({id})=>id),
                });
                this.switch('trajectory');
                this.#pages.trajectory.born(contents);
                // $(document).keydown(function(event){
                //     if(event.which == 32 || event.which == 13){
                //         $('#lifeTrajectory').click();
                //     }
                // })
            });

        // Trajectory
        const trajectoryPage = $(`
        <div id="main">
            <ul id="lifeProperty" class="lifeProperty"></ul>
            <ul id="lifeTrajectory" class="lifeTrajectory"></ul>
            <div class="btn-area">
                <button id="auto" class="mainbtn">Autoplay</button>
                <button id="auto2x" class="mainbtn">Autoplay2x</button>
                <button id="summary" class="mainbtn">Life Recap</button>
                <button id="domToImage" class="mainbtn">Life Replay</button>
            </div>
            <div class="domToImage2wx">
                <img src="" id="endImage" />
            </div>
        </div>
        `);

        trajectoryPage
            .find('#lifeTrajectory')
            .click(()=>{
                if(this.#isEnd) return;
                const trajectory = this.#life.next();
                const { age, content, isEnd } = trajectory;
                const li = $(`<li><span>Age ${age}:</span><span>${
                    content.map(
                        ({type, description, grade, name, postEvent}) => {
                            switch(type) {
                                case 'TLT':
                                    return `Trigger Talent【${name}】：${description}`;
                                case 'EVT':
                                    return description + (postEvent?`<br>${postEvent}`:'');
                            }
                        }
                    ).join('<br>')
                }</span></li>`);
                li.appendTo('#lifeTrajectory');
                $("#lifeTrajectory").scrollTop($("#lifeTrajectory")[0].scrollHeight);
                if(isEnd) {
                    $(document).unbind("keydown");
                    this.#isEnd = true;
                    trajectoryPage.find('#summary').show();
                    trajectoryPage.find('#auto').hide();
                    trajectoryPage.find('#auto2x').hide();
                    // trajectoryPage.find('#domToImage').show();
                }
                const property = this.#life.getLastRecord();
                $("#lifeProperty").html(`
                <li><span>Appearance</span><span>${property.CHR}</span></li>
                <li><span>Intelligence</span><span>${property.INT}</span></li>
                <li><span>Health</span><span>${property.STR}</span></li>
                <li><span>Family Wealth</span><span>${property.MNY}</span></li>
                <li><span>Happiness</span><span>${property.SPR}</span></li>
                `);
            });
        // html2canvas
        trajectoryPage
            .find('#domToImage')
            .click(()=>{
                $("#lifeTrajectory").addClass("deleteFixed");
                const ua = navigator.userAgent.toLowerCase();
                domtoimage.toJpeg(document.getElementById('lifeTrajectory'))
                    .then(function (dataUrl) {
                        let link = document.createElement('a');
                        link.download = '我的人生回放.jpeg';
                        link.href = dataUrl;
                        link.click();
                        $("#lifeTrajectory").removeClass("deleteFixed");
                        // 微信内置浏览器，显示图片，需要用户单独保存
                        if(ua.match(/MicroMessenger/i)=="micromessenger") {
                            $('#endImage').attr('src', dataUrl);
                        }

                    });
            })
            .hide();

        trajectoryPage
            .find('#summary')
            .click(()=>{
                clearInterval(this.#autoTrajectory);
                this.#autoTrajectory = null;
                this.switch('summary');
            });

        const auto = tick=>{
            if(this.#autoTrajectory) {
                clearInterval(this.#autoTrajectory);
                this.#autoTrajectory = null;
            } else {
                if(!this.isEnd)
                    trajectoryPage
                        .find('#lifeTrajectory')
                        .click();
                this.#autoTrajectory = setInterval(()=>{
                    if(this.isEnd) {
                        clearInterval(this.#autoTrajectory);
                        this.#autoTrajectory = null;
                    } else {
                        trajectoryPage
                            .find('#lifeTrajectory')
                            .click();
                    }
                }, tick);
            }
        };

        trajectoryPage
            .find('#auto')
            .click(()=>auto(1000));
        trajectoryPage
            .find('#auto2x')
            .click(()=>auto(500));

        // Summary
        const summaryPage = $(`
        <div id="main">
            <div class="head">Life Recap</div>
            <ul id="judge" class="judge">
                <li class="grade2"><span>Appearance：</span><span>9级 美若天仙</span></li>
                <li class="grade0"><span>Intelligence：</span><span>4级 智力一般</span></li>
                <li class="grade0"><span>Health：</span><span>1级 极度虚弱</span></li>
                <li class="grade0"><span>Family Wealth：</span><span>6级 小康之家</span></li>
                <li class="grade0"><span>Age：</span><span>3岁 早夭</span></li>
                <li class="grade0"><span>Happiness：</span><span></span>3级 不太幸福的人生</li>
            </ul>
            <div class="head" style="height:auto;">Talent: Pick the one you want to have for the next life</div>
            <ul id="talents" class="selectlist" style="flex: 0 1 auto;">
                <li class="grade2b">黑幕（面试一定成功）</li>
            </ul>
            <button id="again" class="mainbtn"><span class="iconfont">&#xe6a7;</span>Start Again</button>
        </div>
        `);

        summaryPage
            .find('#again')
            .click(()=>{
                this.times ++;
                this.#life.talentExtend(this.#selectedExtendTalent);
                this.#selectedExtendTalent = null;
                this.#talentSelected.clear();
                this.#totalMax = 20;
                this.#isEnd = false;
                this.switch('index');
            });

        this.#pages = {
            loading: {
                page: loadingPage,
                clear: ()=>{
                    this.#currentPage = 'loading';
                },
            },
            index: {
                page: indexPage,
                btnAchievement: indexPage.find('#achievement'),
                btnRestart: indexPage.find('#restart'),
                hint: indexPage.find('.hint'),
                pressEnter: ()=>{
                    this.#pages.index.btnRestart.click();
                },
                clear: ()=>{
                    this.#currentPage = 'index';
                    indexPage.find('.hint').hide();

                    const times = this.times;
                    const achievement = indexPage.find('#achievement');
                    const discord = indexPage.find('#discord');
                    const specialthanks = indexPage.find('#specialthanks');

                    if(times > 0) {
                        achievement.show();
                        discord.show();
                        specialthanks.show();
                        return;
                    }

                    achievement.hide();
                    discord.hide();
                    specialthanks.hide();
                },
            },
            specialthanks: {
                page: specialThanksPage,
                clear: () => {
                    const groups = [
                        specialThanksPage.find('#spthx > ul.g1'),
                        specialThanksPage.find('#spthx > ul.g2'),
                    ];
                    groups.forEach(g=>g.empty());
                    this.#specialthanks
                        .sort(()=>0.5-Math.random())
                        .forEach(({group, name, comment, color})=>groups[--group].append(`
                            <li>
                                <span class="name" ${color?('style="color:'+color+'"'):''}>${name}</span>
                                <span class="comment">${comment||''}</span>
                            </li>
                        `))
                }
            },
            achievement: {
                page: achievementPage,
                clear: () => {
                    const total = achievementPage.find("ul#total");
                    const achievements = achievementPage.find("ul#achievements");
                    total.empty();
                    achievements.empty();

                    const formatRate = (type, value) => {
                        const rate = getRate(type, value);
                        let color = Object.keys(rate)[0];
                        switch(parseInt(color)) {
                            case 0: color = '白色'; break;
                            case 1: color = '蓝色'; break;
                            case 2: color = '紫色'; break;
                            case 3: color = '橙色'; break;
                            default: break;
                        }
                        let r = Object.values(rate)[0];
                        switch(parseInt(r)) {
                            case 1: r = 'Same'; break;
                            case 2: r = 'Double'; break;
                            case 3: r = 'Triple'; break;
                            case 4: r = 'Quadruple'; break;
                            case 5: r = 'Five times'; break;
                            case 6: r = 'Six times'; break;
                            default: break;
                        }
                        return `The change you get ${color} is ${r}`;
                    }

                    const { times, achievement, talentRate, eventRate } = this.#life.getTotal();
                    total.append(`
                        <li class="achvg${getGrade('times', times)}"><span class="achievementtitle">You already started ${times} times</span>${formatRate('times', times)}</li>
                        <li class="achvg${getGrade('achievement', achievement)}"><span class="achievementtitle">${achievement} achievements completed</span>${formatRate('achievement', achievement)}</li>
                        <li class="achvg${getGrade('eventRate', eventRate)}"><span class="achievementtitle">Event Collection Rate</span>${Math.floor(eventRate * 100)}%</li>
                        <li class="achvg${getGrade('talentRate', talentRate)}"><span class="achievementtitle">Talent Collection Rate</span>${Math.floor(talentRate * 100)}%</li>
                    `);

                    const achievementsData = this.#life.getAchievements();
                    achievementsData.forEach(({
                        name, description, hide,
                        grade, isAchieved
                    })=>{
                        if(hide && !isAchieved) name = description = '???';
                        achievements.append(
                            `<li class="achvg${grade} ${isAchieved?'':'mask'}"><span class="achievementtitle">${name}</span>${description}</li>`
                        );
                    })

                }
            },
            talent: {
                page: talentPage,
                talentList: talentPage.find('#talents'),
                btnRandom: talentPage.find('#random'),
                btnNext: talentPage.find('#next'),
                pressEnter: ()=>{
                    const talentList = this.#pages.talent.talentList;
                    const btnRandom = this.#pages.talent.btnRandom;
                    const btnNext = this.#pages.talent.btnNext;
                    if (talentList.children().length) {
                        btnNext.click();
                    } else {
                        btnRandom.click();
                    }
                },
                clear: ()=>{
                    this.#currentPage = 'talent';
                    talentPage.find('ul.selectlist').empty();
                    talentPage.find('#random').show();
                    this.#totalMax = 20;
                },
            },
            property: {
                page: propertyPage,
                btnStart: propertyPage.find('#start'),
                pressEnter: ()=>{
                    this.#pages.property.btnStart.click();
                },
                clear: ()=>{
                    this.#currentPage = 'property';
                    freshTotal();
                    propertyPage
                        .find('#talentSelectedView')
                        .empty();
                },
            },
            trajectory: {
                page: trajectoryPage,
                lifeTrajectory: trajectoryPage.find('#lifeTrajectory'),
                pressEnter: ()=>{
                    this.#pages.trajectory.lifeTrajectory.click();
                },
                clear: ()=>{
                    this.#currentPage = 'trajectory';
                    trajectoryPage.find('#lifeTrajectory').empty();
                    trajectoryPage.find('#summary').hide();
                    trajectoryPage.find('#auto').show();
                    trajectoryPage.find('#auto2x').show();
                    this.#isEnd = false;
                },
                born: contents => {
                    if(contents.length > 0)
                        $('#lifeTrajectory')
                            .append(`<li><span>Beginning：</span><span>${
                                contents.map(
                                    ({source, target}) => `Trigger Talent【${source.name}】: Replace to Talent【${target.name}】`
                                ).join('<br>')
                            }</span></li>`);

                    trajectoryPage.find('#lifeTrajectory').trigger("click");
                }
            },
            summary: {
                page: summaryPage,
                clear: ()=>{
                    this.#currentPage = 'summary';
                    const judge = summaryPage.find('#judge');
                    const talents = summaryPage.find('#talents');
                    judge.empty();
                    talents.empty();
                    const lastExtendTalent = this.#life.getLastExtendTalent();
                    Array
                        .from(this.#talentSelected)
                        .sort((
                            {id:a, grade:ag},
                            {id:b, grade:bg},
                        )=>{
                            if(a == lastExtendTalent) return -1;
                            if(b == lastExtendTalent) return 1;
                            return bg - ag;
                        })
                        .forEach((talent, i)=>{
                            const li = createTalent(talent);
                            talents.append(li);
                            li.click(()=>{
                                if(li.hasClass('selected')) {
                                    this.#selectedExtendTalent = null;
                                    li.removeClass('selected');
                                } else if(this.#selectedExtendTalent != null) {
                                    this.hint('You can only inherit one talent');
                                    return;
                                } else {
                                    this.#selectedExtendTalent = talent.id;
                                    li.addClass('selected');
                                }
                            });
                            if(!i) li.click();
                        });

                    const summaryData = this.#life.getSummary();
                    const format = (discription, type)=>{
                        const value = summaryData[type];
                        const { judge, grade } = summary(type, value);
                        return `<li class="grade${grade}"><span>${discription}：</span><span>${value} ${judge}</span></li>`;
                    };

                    judge.append(`
                        ${format('Appearance', 'CHR')}
                        ${format('Intelligence', 'INT')}
                        ${format('Health', 'STR')}
                        ${format('Family Wealth', 'MNY')}
                        ${format('Happiness', 'SPR')}
                        ${format('Age', 'AGE')}
                        ${format('Total Score', 'SUM')}
                    `);
                }
            },
        }

        $$on('achievement', ({name})=>{
            this.hint(`Unlock Achievements【${name}】`, 'success');
        })
    }

    switch(page) {
        const p = this.#pages[page];
        if(!p) return;
        $('#main').detach();
        p.clear();
        p.page.appendTo('body');
        if(typeof p.page.mounted === 'function'){
            p.page.mounted()
        }
    }

    hint(message, type='info') {
        if(this.#hintTimeout) {
            clearTimeout(this.#hintTimeout);
            this.#hintTimeout = null;
        }
        hideBanners();
        requestAnimationFrame(() => {
            const banner = $(`.banner.${type}`);
            banner.addClass('visible');
            banner.find('.banner-message').text(message);
            if(type != 'error') {
                this.#hintTimeout = setTimeout(hideBanners, 3000);
            }
        });
    }

    setTheme(theme) {
        const themeLink = $(document).find('#themeLink');

        if(theme == 'light') {
            themeLink.attr('href', 'light.css');
        } else {
            themeLink.attr('href', 'dark.css');
        }
    }

    get times() {return this.#life?.times || 0;}
    set times(v) { if(this.#life) this.#life.times = v };

}

export default App;
