const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const cors = require('cors');

app.set('port', process.env.PORT || 4000)
//app.use(cors());
//app.use(cors({origin: 'http://localhost:3000'}));
app.use(cors({origin: 'https://60adabac7bfd1b16c6a7aa52--journalsearch.netlify.app'}));

app.get('/ejemplo', (request, response) => {
    response.json({
        nombre:'busqueda',
        revistas:[
            {
                title: "revista computación",
                citations: 545
            },
            {
                title: "revista ciencias",
                citations: 548
            }
        ]
    });
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

app.post('/buscar', asyncMiddleware(async (request, response, next)  => {
    //#region  console.log
    console.log('All: ' + request.body.all);
    console.log('journal: ' + request.body.journal);
    console.log('book: ' + request.body.book);
    console.log('top10: ' + request.body.top10);
    console.log('q1: ' + request.body.q1);
    console.log('q2: ' + request.body.q2);
    console.log('q3: ' + request.body.q3);
    console.log('q4: ' + request.body.q4);
    console.log('Keyword: ' + request.body.keyword);
    console.log('Area: ' + request.body.area);
    console.log('Subarea: ' + request.body.subarea);
    //#endregion

    /* Puppeteer */
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    try{
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto('https://www.scopus.com/sources.uri', {
            networkIdleTimeout: 1000,
            waitUntil: 'networkidle',
            timeout: 3000000
          });

        //#region Select search by journals
        /********************************************************************************************/
        /*                      Seleccionar búsqueda por journals                                   */
        /********************************************************************************************/
        if(request.body.all == false && request.body.journal == true){
            await page.waitForSelector('#src-j');
            await page.evaluate(()=>document.getElementById('src-j').click());
            await page.waitForSelector('.list-inline');
            await page.click('input[name="Apply"]');
        }
        /********************************************************************************************/
        //#endregion

        //#region Select search by books
        /********************************************************************************************/
        /*                      Seleccionar búsqueda por books                                   */
        /********************************************************************************************/
        if(request.body.all == false && request.body.book == true){
            await page.waitForSelector('#src-k');
            await page.evaluate(()=>document.getElementById('src-k').click());
            await page.waitForSelector('.list-inline');
            await page.click('input[name="Apply"]');
        }
        /********************************************************************************************/
        //#endregion

        //#region Select search by journals and books
        /********************************************************************************************/
        /*                      Seleccionar búsqueda por journals and books                                   */
        /********************************************************************************************/
        if(request.body.all == true){
            await page.waitForSelector('#src-j');
            await page.evaluate(()=>document.getElementById('src-j').click());
            await page.waitForSelector('#src-k');
            await page.evaluate(()=>document.getElementById('src-k').click());
            await page.waitForSelector('.list-inline');
            await page.click('input[name="Apply"]');
        }
        /********************************************************************************************/
        //#endregion

        //#region Select 200 results per page
        /********************************************************************************************/
        /*                      Seleccionar 200 resultados por página                               */
        /********************************************************************************************/
        await page.waitForSelector('#sourceResults-paginationContainer');
        await page.waitForSelector('#sourceResults-paginationFooter');
        await page.waitForSelector('#sourceResults-resultsPerPage');
        await page.evaluate(()=>document.getElementById('sourceResults-resultsPerPage').click());
        await page.waitForSelector('#sourceResults-resultsPerPageOuterContainer');
        await page.evaluate(()=>document.getElementById('sourceResults-resultsPerPage-button').click());
        await page.waitForSelector('#sourceResults-paginationLinks');
        await page.waitForSelector('#sourceResults-resultsPerPage-menu');
        await page.evaluate(()=>document.getElementById('sourceResults-resultsPerPage-menu').click());
        await page.waitForSelector('.ui-menu-item');
        await page.waitForSelector('#ui-id-4');
        await Promise.all([
            page.click("#ui-id-4"),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ])
        /********************************************************************************************/
        //#endregion

        //#region Select search by Quartile
        /********************************************************************************************/
        /*                            Seleccionar búsqueda por Quartil                                   */
        /********************************************************************************************/
        await page.waitForSelector('#body_displayOption');
        await page.waitForSelector('#bestPercentile');
        if(request.body.top10 == true){
            await page.evaluate(()=>document.getElementById('bestPercentile').click());
        }
        if(request.body.q1 == true){
            await page.evaluate(()=>document.getElementById('1Quartile').click());
        }
        if(request.body.q2 == true){
            await page.evaluate(()=>document.getElementById('2Quartile').click());
        }
        if(request.body.q3 == true){
            await page.evaluate(()=>document.getElementById('3Quartile').click());
        }
        if(request.body.q4 == true){
            await page.evaluate(()=>document.getElementById('4Quartile').click());
        }
        if(request.body.top10 == true || request.body.q1 == true || request.body.q2 == true ||
            request.body.q3 == true || request.body.q4 == true){
                await page.waitForSelector('.list-inline');
                await page.click('input[name="Apply"]');
        }
        /********************************************************************************************/
        //#endregion

        //#region Search by title
        /********************************************************************************************/
        /*                      Busqueda por Titulo                             */
        /********************************************************************************************/
        if(request.body.keyword.trim() != ""){
            //Seleccionar la búsqueda por titulo
            await page.waitForSelector('.ui-selectmenu-text');
            await page.click('.ui-selectmenu-text');
            //Escribir por titulo
            await page.waitForSelector('#ui-id-2');
            await page.click('#ui-id-2');
            await page.type('#search-term', request.body.keyword.trim());
            //Click en el botón buscar
            await page.click('#sourceSearchBtn button');
        }
        /********************************************************************************************/
        //#endregion

        //#region Search by area
        /********************************************************************************************/
        /*                              Búsqueda por área temática                                  */
        /********************************************************************************************/
        if(request.body.area != -1){
            await page.waitForSelector('.ui-selectmenu-text');
            await page.click('.ui-selectmenu-text');
            await page.click('#ui-id-1');
            //Click en la casilla de texto
            await page.click('#search-term');
            //Espera del despliegue del acordión de area temática
            await page.waitForSelector('#autoSuggContainer');
            await page.waitForSelector('#ui-autocomplete-source');
            await page.waitForSelector('#collapse_autoSugg0_link');

            //#region Agricultural and Biological Sciences
            /********************************************************************************************/
            /*-- Área temática Agricultural and Biological Sciences --*/
            /********************************************************************************************/
            if(request.body.area == 0){
                await page.waitForSelector('#subj-sugg11');
                await page.evaluate(()=>document.getElementById('subj-sugg11').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    //Agricultural and Biological Sciences (miscellaneous)
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1101');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1101').click())
                    }
                    //Agronomy and Crop Science
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1102');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1102').click())
                    }
                    //Animal Science and Zoology
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1103');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1103').click())
                    }
                    //Aquatic Science
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1104');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1104').click())
                    }
                    //Ecology, Evolution, Behavior and Systematics
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1105');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1105').click())
                    }
                    //Food Science
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1106');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1106').click())
                    }
                    //Forestry
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1107');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1107').click())
                    }
                    //General Agricultural and Biological Sciences
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1100');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1100').click())
                    }
                    //Horticulture
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1108');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1108').click())
                    }
                    //Insect Science
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child1109');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1109').click())
                    }
                    //Plant Science
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child1110');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1110').click())
                    }
                    //Soil Science
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child1111');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1111').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Arts and Humanities
            /********************************************************************************************/
            /*-- Área temática Arts and Humanities --*/
            /********************************************************************************************/
            if(request.body.area == 1){
                await page.waitForSelector('#subj-sugg12');
                await page.evaluate(()=>document.getElementById('subj-sugg12').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    //Archeology (arts and humanities)
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1204');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1204').click())
                    }
                    //Arts and Humanities (miscellaneous)
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1201');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1201').click())
                    }
                    //Classics
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1205');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1205').click())
                    }
                    //Conservation
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1206');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1206').click())
                    }
                    //General Arts and Humanities
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1200');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1200').click())
                    }
                    //History
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1202');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1202').click())
                    }
                    //History and Philosophy of Science
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1207');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1207').click())
                    }
                    //Language and Linguistics
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1203');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1203').click())
                    }
                    //Literature and Literary Theory
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1208');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1208').click())
                    }
                    //Museology
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child1209');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1209').click())
                    }
                    //Music
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child1210');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1210').click())
                    }
                    //Philosophy
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child1211');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1211').click())
                    }
                    //Religious Studies
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child1212');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1212').click())
                    }
                    //Visual Arts and Performing Arts
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child1213');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1213').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Biochemistry, Genetics and Molecular Biology
            /********************************************************************************************/
            /*-- Área temática Biochemistry, Genetics and Molecular Biology --*/
            /********************************************************************************************/
            if(request.body.area == 2){
                await page.waitForSelector('#subj-sugg13');
                await page.evaluate(()=>document.getElementById('subj-sugg13').click());

                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    //Aging
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1302');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1302').click())
                    }
                    //Biochemistry
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1303');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1303').click())
                    }
                    //Biochemistry, Genetics and Molecular Biology (miscellaneous)
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1301');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1301').click())
                    }
                    //Biophysics
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1304');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1304').click())
                    }
                    //Biotechnology
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1305');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1305').click())
                    }
                    //Cancer Research
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1306');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1306').click())
                    }
                    //Cell Biology
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1307');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1307').click())
                    }
                    //Clinical Biochemistry
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1308');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1308').click())
                    }
                    //Developmental Biology
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1309');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1309').click())
                    }
                    //Endocrinology
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child1310');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1310').click())
                    }
                    //General Biochemistry, Genetics and Molecular Biology
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child1300');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1300').click())
                    }
                    //Genetics
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child1311');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1311').click())
                    }
                    //Molecular Biology
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child1312');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1312').click())
                    }
                    //Molecular Medicine
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child1313');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1313').click())
                    }
                    //Physiology
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child1314');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1314').click())
                    }
                    //Structural Biology
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child1315');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1315').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Business, Management and Accounting
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 3){
                await page.waitForSelector('#subj-sugg14');
                await page.evaluate(()=>document.getElementById('subj-sugg14').click());
                if(request.body.subarea != -1){
                        /*------------------------------------------------------------------------------------------*/
                        /* Subáreas */
                        /*------------------------------------------------------------------------------------------*/
                        //Accounting
                        if(request.body.subarea == 0){
                            await page.waitForSelector('#subj-sugg-child1402');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1402').click())
                        }
                        //Business and International Management
                        if(request.body.subarea == 1){
                            await page.waitForSelector('#subj-sugg-child1403');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1403').click())
                        }
                        //Business, Management and Accounting (miscellaneous)
                        if(request.body.subarea == 2){
                            await page.waitForSelector('#subj-sugg-child1401');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1401').click())
                        }
                        //General Business, Management and Accounting
                        if(request.body.subarea == 3){
                            await page.waitForSelector('#subj-sugg-child1400');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1400').click())
                        }
                        //Industrial Relations
                        if(request.body.subarea == 4){
                            await page.waitForSelector('#subj-sugg-child1410');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1410').click())
                        }
                        //Management Information Systems
                        if(request.body.subarea == 5){
                            await page.waitForSelector('#subj-sugg-child1404');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1404').click())
                        }
                        //Management of Technology and Innovation
                        if(request.body.subarea == 6){
                            await page.waitForSelector('#subj-sugg-child1405');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1405').click())
                        }
                        //Marketing
                        if(request.body.subarea == 7){
                            await page.waitForSelector('#subj-sugg-child1406');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1406').click())
                        }
                        //Organizational Behavior and Human Resource Management
                        if(request.body.subarea == 8){
                            await page.waitForSelector('#subj-sugg-child1407');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1407').click())
                        }
                        //Strategy and Management
                        if(request.body.subarea == 9){
                            await page.waitForSelector('#subj-sugg-child1408');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1408').click())
                        }
                        //Tourism, Leisure and Hospitality Management
                        if(request.body.subarea == 10){
                            await page.waitForSelector('#subj-sugg-child1409');
                            await page.evaluate(()=>document.getElementById('subj-sugg-child1409').click())
                        }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Chemical Engineering
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 4){
                await page.waitForSelector('#subj-sugg15');
                await page.evaluate(()=>document.getElementById('subj-sugg15').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    //Bioengineering
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1502');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1502').click())
                    }
                    //Catalysis
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1503');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1503').click())
                    }
                    //Chemical Engineering (miscellaneous)
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1501');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1501').click())
                    }
                    //Chemical Health and Safety
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1504');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1504').click())
                    }
                    //Colloid and Surface Chemistry
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1505');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1505').click())
                    }
                    //Filtration and Separation
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1506');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1506').click())
                    }
                    //Fluid Flow and Transfer Processes
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1507');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1507').click())
                    }
                    //General Chemical Engineering
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1500');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1500').click())
                    }
                    //Process Chemistry and Technology
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1508');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1508').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Chemistry
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 5){
                await page.waitForSelector('#subj-sugg16');
                await page.evaluate(()=>document.getElementById('subj-sugg16').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    //Analytical Chemistry
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1602');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1602').click())
                    }
                    //Chemistry (miscellaneous)
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1601');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1601').click())
                    }
                    //Electrochemistry
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1603');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1603').click())
                    }
                    //General Chemistry
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1600');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1600').click())
                    }
                    //Inorganic Chemistry
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1604');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1604').click())
                    }
                    //Organic Chemistry
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1605');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1605').click())
                    }
                    //Physical and Theoretical Chemistry
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1606');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1606').click())
                    }
                    //Spectroscopy
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1607');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1607').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Computer Science
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 6){
                await page.waitForSelector('#subj-sugg17');
                await page.evaluate(()=>document.getElementById('subj-sugg17').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1702');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1702').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1703');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1703').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1704');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1704').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1705');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1705').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1701');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1701').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1706');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1706').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1707');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1707').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1700');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1700').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1708');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1708').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child1709');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1709').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child1710');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1710').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child1711');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1711').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child1712');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1712').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Decision Sciences
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 7){
                await page.waitForSelector('#subj-sugg18');
                await page.evaluate(()=>document.getElementById('subj-sugg18').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1801');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1801').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1800');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1800').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1802');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1802').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1803');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1803').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1804');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1804').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Dentistry
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 8){
                await page.waitForSelector('#subj-sugg35');
                await page.evaluate(()=>document.getElementById('subj-sugg35').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3502');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3502').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3503');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3503').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3501');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3501').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3500');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3500').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3504');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3504').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3505');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3505').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child3506');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3506').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Earth and Planetary Sciences
            /********************************************************************************************/
            /*-- Área temática --*/
            /********************************************************************************************/
            if(request.body.area == 9){
                await page.waitForSelector('#subj-sugg19');
                await page.evaluate(()=>document.getElementById('subj-sugg19').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1902');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1902').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child1903');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1903').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child1901');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1901').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child1904');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1904').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child1905');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1905').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child1900');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1900').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child1906');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1906').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child1907');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1907').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child1908');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1908').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child1909');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1909').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child1910');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1910').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child1911');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1911').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child1912');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1912').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child1913');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1913').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Economics, Econometrics and Finance
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 10){
                await page.waitForSelector('#subj-sugg20');
                await page.evaluate(()=>document.getElementById('subj-sugg20').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2002');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2002').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2001');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2001').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2003');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2003').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2000');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2000').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Energy
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 11){
                await page.waitForSelector('#subj-sugg21');
                await page.evaluate(()=>document.getElementById('subj-sugg21').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2101');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2101').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2102');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2102').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2103');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2103').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2100');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2100').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2104');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2104').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2105');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2105').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Engineering
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 11){
                await page.waitForSelector('#subj-sugg22');
                await page.evaluate(()=>document.getElementById('subj-sugg22').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2202');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2202').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2216');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2216').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2203');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2203').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2204');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2204').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2215');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2215').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2205');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2205').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2206');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2206').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2207');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2207').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2208');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2208').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2201');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2201').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child2200');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2200').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child2209');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2209').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child2210');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2210').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child2211');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2211').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child2214');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2214').click())
                    }
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child2212');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2212').click())
                    }
                    if(request.body.subarea == 16){
                        await page.waitForSelector('#subj-sugg-child2213');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2213').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Environmental Science
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 12){
                await page.waitForSelector('#subj-sugg23');
                await page.evaluate(()=>document.getElementById('subj-sugg23').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2302');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2302').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2303');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2303').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2304');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2304').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2305');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2305').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2301');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2301').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2300');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2300').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2306');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2306').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2307');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2307').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2308');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2308').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2309');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2309').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child2310');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2310').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child2311');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2311').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child2312');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2312').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Health Professions
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 13){
                await page.waitForSelector('#subj-sugg36');
                await page.evaluate(()=>document.getElementById('subj-sugg36').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3602');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3602').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3603');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3603').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3604');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3604').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3600');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3600').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3605');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3605').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3601');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3601').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child3606');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3606').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child3607');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3607').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child3608');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3608').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child3609');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3609').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child3610');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3610').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child3611');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3611').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child3612');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3612').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child3613');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3613').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child3614');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3614').click())
                    }
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child3615');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3615').click())
                    }
                    if(request.body.subarea == 16){
                        await page.waitForSelector('#subj-sugg-child3616');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3616').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Immunology and Microbiology
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 13){
                await page.waitForSelector('#subj-sugg24');
                await page.evaluate(()=>document.getElementById('subj-sugg24').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2402');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2402').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2400');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2400').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2403');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2403').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2401');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2401').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2404');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2404').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2405');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2405').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2406');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2406').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Materials Science
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 14){
                await page.waitForSelector('#subj-sugg25');
                await page.evaluate(()=>document.getElementById('subj-sugg25').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2502');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2502').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2503');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2503').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2504');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2504').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2500');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2500').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2505');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2505').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2501');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2501').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2506');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2506').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2507');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2507').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2508');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2508').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Mathematics
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 15){
                await page.waitForSelector('#subj-sugg26');
                await page.evaluate(()=>document.getElementById('subj-sugg26').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2602');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2602').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2603');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2603').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2604');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2604').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2605');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2605').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2606');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2606').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2607');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2607').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2600');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2600').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2608');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2608').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2609');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2609').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2610');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2610').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child2601');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2601').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child2611');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2611').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child2612');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2612').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child2613');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2613').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child2614');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2614').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Medicine
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 16){
                await page.waitForSelector('#subj-sugg27');
                await page.evaluate(()=>document.getElementById('subj-sugg27').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2702');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2702').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2703');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2703').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2704');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2704').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2705');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2705').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2707');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2707').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2706');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2706').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2708');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2708').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2709');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2709').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2710');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2710').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2711');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2711').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child2712');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2712').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child2713');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2713').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child2714');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2714').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child2715');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2715').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child2700');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2700').click())
                    }
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child2716');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2716').click())
                    }
                    if(request.body.subarea == 16){
                        await page.waitForSelector('#subj-sugg-child2717');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2717').click())
                    }
                    if(request.body.subarea == 17){
                        await page.waitForSelector('#subj-sugg-child2718');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2718').click())
                    }
                    if(request.body.subarea == 18){
                        await page.waitForSelector('#subj-sugg-child2719');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2719').click())
                    }
                    if(request.body.subarea == 19){
                        await page.waitForSelector('#subj-sugg-child2720');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2720').click())
                    }
                    if(request.body.subarea == 20){
                        await page.waitForSelector('#subj-sugg-child2721');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2721').click())
                    }
                    if(request.body.subarea == 21){
                        await page.waitForSelector('#subj-sugg-child2722');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2722').click())
                    }
                    if(request.body.subarea == 22){
                        await page.waitForSelector('#subj-sugg-child2723');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2723').click())
                    }
                    if(request.body.subarea == 23){
                        await page.waitForSelector('#subj-sugg-child2725');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2725').click())
                    }
                    if(request.body.subarea == 24){
                        await page.waitForSelector('#subj-sugg-child2724');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2724').click())
                    }
                    if(request.body.subarea == 25){
                        await page.waitForSelector('#subj-sugg-child2701');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2701').click())
                    }
                    if(request.body.subarea == 26){
                        await page.waitForSelector('#subj-sugg-child2726');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2726').click())
                    }
                    if(request.body.subarea == 27){
                        await page.waitForSelector('#subj-sugg-child2727');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2727').click())
                    }
                    if(request.body.subarea == 28){
                        await page.waitForSelector('#subj-sugg-child2728');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2728').click())
                    }
                    if(request.body.subarea == 29){
                        await page.waitForSelector('#subj-sugg-child2729');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2729').click())
                    }
                    if(request.body.subarea == 30){
                        await page.waitForSelector('#subj-sugg-child2730');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2730').click())
                    }
                    if(request.body.subarea == 31){
                        await page.waitForSelector('#subj-sugg-child2731');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2731').click())
                    }
                    if(request.body.subarea == 32){
                        await page.waitForSelector('#subj-sugg-child2732');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2732').click())
                    }
                    if(request.body.subarea == 33){
                        await page.waitForSelector('#subj-sugg-child2733');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2733').click())
                    }
                    if(request.body.subarea == 34){
                        await page.waitForSelector('#subj-sugg-child2734');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2734').click())
                    }
                    if(request.body.subarea == 35){
                        await page.waitForSelector('#subj-sugg-child2735');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2735').click())
                    }
                    if(request.body.subarea == 36){
                        await page.waitForSelector('#subj-sugg-child2736');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2736').click())
                    }
                    if(request.body.subarea == 37){
                        await page.waitForSelector('#subj-sugg-child2737');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2737').click())
                    }
                    if(request.body.subarea == 38){
                        await page.waitForSelector('#subj-sugg-child2738');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2738').click())
                    }
                    if(request.body.subarea == 39){
                        await page.waitForSelector('#subj-sugg-child2739');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2739').click())
                    }
                    if(request.body.subarea == 40){
                        await page.waitForSelector('#subj-sugg-child2740');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2740').click())
                    }
                    if(request.body.subarea == 41){
                        await page.waitForSelector('#subj-sugg-child2741');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2741').click())
                    }
                    if(request.body.subarea == 42){
                        await page.waitForSelector('#subj-sugg-child2742');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2742').click())
                    }
                    if(request.body.subarea == 43){
                        await page.waitForSelector('#subj-sugg-child2743');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2743').click())
                    }
                    if(request.body.subarea == 44){
                        await page.waitForSelector('#subj-sugg-child2744');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2744').click())
                    }
                    if(request.body.subarea == 45){
                        await page.waitForSelector('#subj-sugg-child2745');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2745').click())
                    }
                    if(request.body.subarea == 46){
                        await page.waitForSelector('#subj-sugg-child2746');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2746').click())
                    }
                    if(request.body.subarea == 47){
                        await page.waitForSelector('#subj-sugg-child2747');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2747').click())
                    }
                    if(request.body.subarea == 48){
                        await page.waitForSelector('#subj-sugg-child2748');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2748').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Multidisciplinary
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 17){
                await page.waitForSelector('#subj-sugg10');
                await page.evaluate(()=>document.getElementById('subj-sugg10').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child1000');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child1000').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Neuroscience
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 18){
                await page.waitForSelector('#subj-sugg28');
                await page.evaluate(()=>document.getElementById('subj-sugg28').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2802');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2802').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2803');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2803').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2804');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2804').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2805');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2805').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2806');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2806').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2807');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2807').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2800');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2800').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2808');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2808').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2801');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2801').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2809');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2809').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Nursing
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 19){
                await page.waitForSelector('#subj-sugg29');
                await page.evaluate(()=>document.getElementById('subj-sugg29').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child2902');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2902').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child2903');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2903').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child2904');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2904').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child2905');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2905').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child2906');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2906').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child2907');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2907').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child2908');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2908').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child2900');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2900').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child2909');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2909').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child2910');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2910').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child2912');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2912').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child2911');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2911').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child2913');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2913').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child2914');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2914').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child2915');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2915').click())
                    }
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child2901');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2901').click())
                    }
                    if(request.body.subarea == 16){
                        await page.waitForSelector('#subj-sugg-child2916');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2916').click())
                    }
                    if(request.body.subarea == 17){
                        await page.waitForSelector('#subj-sugg-child2917');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2917').click())
                    }
                    if(request.body.subarea == 18){
                        await page.waitForSelector('#subj-sugg-child2918');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2918').click())
                    }
                    if(request.body.subarea == 19){
                        await page.waitForSelector('#subj-sugg-child2919');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2919').click())
                    }
                    if(request.body.subarea == 20){
                        await page.waitForSelector('#subj-sugg-child2920');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2920').click())
                    }
                    if(request.body.subarea == 21){
                        await page.waitForSelector('#subj-sugg-child2921');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2921').click())
                    }
                    if(request.body.subarea == 22){
                        await page.waitForSelector('#subj-sugg-child2922');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2922').click())
                    }
                    if(request.body.subarea == 23){
                        await page.waitForSelector('#subj-sugg-child2923');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child2923').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Pharmacology, Toxicology and Pharmaceutics
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 20){
                await page.waitForSelector('#subj-sugg30');
                await page.evaluate(()=>document.getElementById('subj-sugg30').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3002');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3002').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3000');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3000').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3003');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3003').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3004');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3004').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3001');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3001').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3005');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3005').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Physics and Astronomy
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 21){
                await page.waitForSelector('#subj-sugg31');
                await page.evaluate(()=>document.getElementById('subj-sugg31').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3102');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3102').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3103');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3103').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3107');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3107').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3104');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3104').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3100');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3100').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3105');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3105').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child3106');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3106').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child3101');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3101').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child3108');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3108').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child3109');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3109').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child3110');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3110').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Psychology
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 22){
                await page.waitForSelector('#subj-sugg32');
                await page.evaluate(()=>document.getElementById('subj-sugg32').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3202');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3202').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3203');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3203').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3204');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3204').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3205');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3205').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3200');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3200').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3206');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3206').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child3201');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3201').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child3207');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3207').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Social Sciences
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 23){
                await page.waitForSelector('#subj-sugg33');
                await page.evaluate(()=>document.getElementById('subj-sugg33').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3314');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3314').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3302');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3302').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3315');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3315').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3316');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3316').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3317');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3317').click())
                    }
                    if(request.body.subarea == 5){
                        await page.waitForSelector('#subj-sugg-child3303');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3303').click())
                    }
                    if(request.body.subarea == 6){
                        await page.waitForSelector('#subj-sugg-child3304');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3304').click())
                    }
                    if(request.body.subarea == 7){
                        await page.waitForSelector('#subj-sugg-child3318');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3318').click())
                    }
                    if(request.body.subarea == 8){
                        await page.waitForSelector('#subj-sugg-child3300');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3300').click())
                    }
                    if(request.body.subarea == 9){
                        await page.waitForSelector('#subj-sugg-child3305');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3305').click())
                    }
                    if(request.body.subarea == 10){
                        await page.waitForSelector('#subj-sugg-child3306');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3306').click())
                    }
                    if(request.body.subarea == 11){
                        await page.waitForSelector('#subj-sugg-child3307');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3307').click())
                    }
                    if(request.body.subarea == 12){
                        await page.waitForSelector('#subj-sugg-child3308');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3308').click())
                    }
                    if(request.body.subarea == 13){
                        await page.waitForSelector('#subj-sugg-child3309');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3309').click())
                    }
                    if(request.body.subarea == 14){
                        await page.waitForSelector('#subj-sugg-child3319');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3319').click())
                    }
                    if(request.body.subarea == 15){
                        await page.waitForSelector('#subj-sugg-child3310');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3310').click())
                    }
                    if(request.body.subarea == 16){
                        await page.waitForSelector('#subj-sugg-child3320');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3320').click())
                    }
                    if(request.body.subarea == 17){
                        await page.waitForSelector('#subj-sugg-child3321');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3321').click())
                    }
                    if(request.body.subarea == 18){
                        await page.waitForSelector('#subj-sugg-child3311');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3311').click())
                    }
                    if(request.body.subarea == 19){
                        await page.waitForSelector('#subj-sugg-child3301');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3301').click())
                    }
                    if(request.body.subarea == 20){
                        await page.waitForSelector('#subj-sugg-child3312');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3312').click())
                    }
                    if(request.body.subarea == 21){
                        await page.waitForSelector('#subj-sugg-child3313');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3313').click())
                    }
                    if(request.body.subarea == 22){
                        await page.waitForSelector('#subj-sugg-child3322');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3322').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion

            //#region Veterinary
            /********************************************************************************************/
            /*-- Área temática  --*/
            /********************************************************************************************/
            if(request.body.area == 24){
                await page.waitForSelector('#subj-sugg34');
                await page.evaluate(()=>document.getElementById('subj-sugg34').click());
                if(request.body.subarea != -1){
                    /*------------------------------------------------------------------------------------------*/
                    /* Subáreas */
                    /*------------------------------------------------------------------------------------------*/
                    if(request.body.subarea == 0){
                        await page.waitForSelector('#subj-sugg-child3402');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3402').click())
                    }
                    if(request.body.subarea == 1){
                        await page.waitForSelector('#subj-sugg-child3403');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3403').click())
                    }
                    if(request.body.subarea == 2){
                        await page.waitForSelector('#subj-sugg-child3400');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3400').click())
                    }
                    if(request.body.subarea == 3){
                        await page.waitForSelector('#subj-sugg-child3404');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3404').click())
                    }
                    if(request.body.subarea == 4){
                        await page.waitForSelector('#subj-sugg-child3401');
                        await page.evaluate(()=>document.getElementById('subj-sugg-child3401').click())
                    }
                }
            }
            /********************************************************************************************/
            //#endregion
        }
        /********************************************************************************************/
        //#endregion

        //#region Apply button
        /********************************************************************************************/
        /*               Botón aplicar                  */
        /********************************************************************************************/
        await page.waitForSelector('#applyBox');
        await page.waitForSelector('.greyBorderTop');
        await page.evaluate(()=>document.getElementById('applyBox').getElementsByTagName('input')[0].click())
        /********************************************************************************************/
        //#endregion

        //#region Get the list data
        /********************************************************************************************/
        /*                      Obtener los datos de la lista                                       */
        /********************************************************************************************/
        await page.waitForSelector('#resultCount');
        var numero = await page.evaluate(()=>{
            const num = document.getElementById('resultCount').textContent
            return num;
        });
        numero = parseInt(numero.split(' ')[0].replace(',', ''));
        await page.evaluate(()=>document.getElementById('src-j').click());
        await page.waitForSelector('#sourceResults');
        await page.waitForSelector('#sourceResults-resultsPerPage');

        const elementos = await page.evaluate(()=>{
            const elements = document.getElementById('sourceResults').querySelectorAll('a');

            const items = [];
            i = 0, j = 0;
            for(let element of elements){
                if(i> 8 && (j%3 == 0)){
                    var elem = { title: element.text , html_url: element.href }
                    items.push(elem);
                }
                i++;
                j++;
            }
            return items;
        });
        /********************************************************************************************/
        //#endregion

        // await page.waitFor(4000);
        console.log(numero)
        response.json(elementos);
    }catch (error){
        console.log('Main error',error)
        response.status(500).send('Something failed!');
    }finally{
        browser.close();
    }


}));

app.get('/',(req, res)=>{
    res.send('Server run... ')
})
app.listen(app.get('port'), ()=>{
    console.log('Listen on port ' + app.get('port') + "...");
});


