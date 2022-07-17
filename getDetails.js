const puppeteer = require('puppeteer');
const axios = require('axios')
const core = require('@actions/core')

const detail = async (detailsOfJobs, listOfJobs) => {
    const browser = await puppeteer.launch({
        headless: true
    }) ;
    const page = await browser.newPage();
   
    for(let elt of listOfJobs){
    let URL = elt.url
        try {
            await page.goto(`${URL}`, {timeout:0, waitUntil: 'networkidle2'});
            const jobs = await page.evaluate((detailsOfJobs)=>{
                let elements = document.querySelector('body > section.col2_max_min > div > div.max > section.contenu_tab > article.all_tab > div.active');
                let item_detail = elements.querySelectorAll('div.item_detail');       
                    
                for(let info of detailsOfJobs){
                    if(info.poste.toString() == elements.querySelector('h2').textContent.toString()){
                        condition = "no"
                        break
                    };
                };

                let detailTEMP = [];
                if(condition == "ok"){
                    let temp = []  
                    temp.push(elements.querySelector('h2').textContent.replaceAll("\n", " "));
                    
                    for(let details of item_detail){
                        let det = details.textContent
                        det = det.substring(25,)
                        temp.push(det);
                    };    
                    detailTEMP = [{
                            poste : temp[0],
                            detailSociete :temp[1],
                            activite : temp[2],
                            mission : temp[3],
                            profil : temp[4],
                            reference : temp[5]   
                        }];
                };
            return detailTEMP
            }, detailsOfJobs);

        detailsOfJobs = ([...detailsOfJobs, ...jobs]);

        } catch (error) {
        console.log(error);
    }   
        
  }
    core.setOutput('detaillist', detailsOfJobs);
    await browser.close();
};

const promise = axios.get("https://raw.githubusercontent.com/Sarobidy-23/webscraping/main/tourisme-voyage-details.json");
  promise
  .then((response) => {
    let result = JSON.stringify(response.data);
    let detailsOfJobs = JSON.parse(result);
    
      const otherPromise = axios.get("https://raw.githubusercontent.com/Sarobidy-23/webscraping/main/tourisme-voyage.json");
          otherPromise
         .then((response) => {
      
          let result = JSON.stringify(response.data);
          let listOfJobs = JSON.parse(result);
            detail(detailsOfJobs, listOfJobs);
      
      }).catch((error) => {
         console.log(error);
      });
      
  }).catch((error) => {
    console.log(error);
  });
