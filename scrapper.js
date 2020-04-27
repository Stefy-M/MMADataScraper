const puppeteer = require('puppeteer');
var fs = require('fs');


(async () => {
    let videoUrl = "http://www.fightmatrix.com/mma-ranks/middleweight/"

    const browser = await puppeteer.launch({headless:true}); // Making headless false shows live example of automation
    const page = await browser.newPage();

    await page.goto(videoUrl, {waitUntil: 'networkidle2'});
    await page.waitForSelector('table.tblRank')

    //Collects each table row 
    const fighterData = await page.$$('table.tblRank > tbody > tr.rankRowX')
    var urls = []
    var names = []
    
    
    //Should be 25
    console.log(fighterData.length)

    //Iterating over each table row 
    //Each instance of fighter is an ElementHandler
    //Store names and links of a tags in an array

    for(const fighter of fighterData){
        
        const linkToFighterpage = await fighter.$('a.sherLink');
        const href = await fighter.$eval(('a.sherLink'), node=>node.href)
        const name = await fighter.$eval(('a.sherLink > strong'),node => node.innerText)
        names.push(name)
        urls.push(href)
    }


    
    //iterate through each page and collect data
    for (let i = 0; i < urls.length; i++) {
        console.clear()
        const url = urls[i];
        await page.goto(`${url}`);
        await page.waitForSelector('div.archivearticle');

        //table rows index 0 and 3 contain the data that i am looking to scrape
        const dataRows = await page.$$('div.archivearticle > table.tblRank > tbody> tr')
        const dataCols1 = await dataRows[0].$eval(('td.tdRankHead'), node=>node.innerText)
        const dataCols2 = await dataRows[3].$eval(('td.tdRank'), node=>node.innerText)

        //Turn data into string and append to file
        const dataString1 = dataCols1.replace(/\n\s*\n/g, '\n')
        const dataString2 = dataCols2.replace(/\n\s*\n/g, '\n')
        const dataToFile = dataString1 + dataString2 + '\n------------------------\n'

        fs.appendFile('MMAMidWeightData.txt', dataToFile, (err)=>{
            if(err) throw err
            console.log('Appending Data...')
        })
          
        
        
    }
    console.clear()
    console.log('Appending data successful')
    await browser.close();
})();