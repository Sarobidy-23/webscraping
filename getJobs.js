const puppeteer = require('puppeteer');
const core = require('@actions/core');
const axios = require('axios');

const content = async (listOfJobs, numPage) => {
    const browser = await puppeteer.launch({
        headless: true
    }) ;
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.portaljob-madagascar.com/emploi/liste/secteur/informatique-web/page/${numPage}`, {timeout: 0, waitUntil: 'networkidle2'});
        await page.awaitForTimeout(100);
        const jobs = await page.evaluate((listOfJobs)=>{
                let elements = document.querySelectorAll('body > section.col2_max_min > div > div.max > article');
                for ( let element of elements){
                    let condition = "ok";
                    for(let i=0; i<20; i++ ){
                        if(listOfJobs[i].poste.toString() == element.querySelector('h3').textContent.toString()){
                            condition = "no";
                            break;
                        };
                    };
                    
                    if(condition == "ok"){
                            listOfJobs.unshift({
                                poste : element.querySelector('h3').textContent ,
                                societe : element.querySelector('h4').textContent,
                                contrat : element.querySelector('h5').textContent,
                                description : element.querySelector('a.description ').text,
                                date: element.querySelector('aside.date_annonce > div.date').textContent,
                                url: element.querySelector('aside.contenu_annonce > h3 > a').href
                            });
                    };
                    condition = "ok";
                };    
            return listOfJobs
            }, listOfJobs)
        core.setOutput('joblist', jobs);
   } catch (error) {
        console.log(error);
   }
    
    await browser.close();
};

const promise = axios.get("https://raw.githubusercontent.com/Sarobidy-23/webscraping/main/informatique-web.json");
    promise
    .then((response) => {   
        let result = JSON.stringify(response.data)
        let listOfJobs = JSON.parse(result)
        content(listOfJobs, 1)    
    }).catch((error) => {
        console.log(error)
    });
