//   node project.js --excel=worldcup.csv --src=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results
let minimist=require('minimist');
let axios=require('axios');
let fs=require('fs');
let excel=require('excel4node');
// let pdf=require('pdf-lib');
let jsdom=require('jsdom');
// const { span } = require('prelude-ls');
let args=minimist(process.argv);
let dwnloadprom = axios.get(args.src);
dwnloadprom.then(
    function(response)
    {
        let html=response.data;
        let dom = new jsdom.JSDOM(html);
        let document=dom.window.document;
        let matcheScoreDivs=document.querySelectorAll('div.match-score-block');
        console.log(matcheScoreDivs.length);
let matches=[];
for(let i=0;i<matcheScoreDivs.length;i++)
{  let match={};
let namePs=matcheScoreDivs[i].querySelectorAll('p.name');
match.t1=namePs[0].textContent;
match.t2=namePs[1].textContent;
let scoreSpans=matcheScoreDivs[i].querySelectorAll("div.score-detail > span.score");
match.t1s="";
match.t2s="";
if(scoreSpans.length==2)
{ match.t1s=scoreSpans[0].textContent;
    match.t2s=scoreSpans[1].textContent;

}
else if(scoreSpans.length==1)
{
    match.t1s=scoreSpans[0].textContent;

}
let spanResult=matcheScoreDivs[i].querySelector('div.status-text > span');
match.result=spanResult.textContent;
matches.push(match);

}
let teams=[];
for(let i=0;i<matches.length;i++)
{
    insertTeamIfDoesnotExist(teams,matches[i]);
 
}
for(let i=0;i<matches.length;i++)
{
   
    insertincorrect(teams,matches[i]);
}
// console.log(teams);
 let str=JSON.stringify(teams);
 
fs.writeFileSync('teams.json',str,'utf-8');
createExcel(teams);





   function createExcel(teams)
   { let wb = new excel.Workbook();
     for(let i=0;i<teams.length;i++)
     { let sheet=wb.addWorksheet(teams[i].name);
        sheet.cell(1,1).string("VS");
        sheet.cell(1,2).string("Self Score");
        sheet.cell(1,3).string("Opp Score");
        sheet.cell(1,4).string("Result");
        
        // console.log(((teams[i]).matches).length);
        for(let j=0;j<((teams[i]).matches).length;j++)
        { 
        
            sheet.cell(j+2,1).string(((teams[i]).matches[j]).opp);
            sheet.cell(j+2,2).string(((teams[i]).matches[j]).score);
            sheet.cell(j+2,3).string(((teams[i]).matches[j]).oppScore);
            sheet.cell(j+2,4).string(((teams[i]).matches[j]).result);



        }
        
         
     }

    wb.write(args.excel);
   }

   function insertTeamIfDoesnotExist(teams,match)
   { 
       let t1idx=teams.findIndex(function(team){
       if(team.name==match.t1)
      { return true;}
       else
       {return false;}
   });
   let t2idx=teams.findIndex(function(team){
    if(team.name==match.t2)
   { return true;}
    else
    {return false;}
});
   if(t1idx==-1)
   {
       let team={
           name:match.t1,
           matches:[]
       };
       teams.push(team);
   }
   if(t2idx==-1)
   {
       let team={
           name:match.t2,
           matches:[]
       };
       teams.push(team);
   } 
}
  function insertincorrect(teams,match) 
  { let t1idx=teams.findIndex(function(team){
      if(team.name==match.t1)
      return true;
      else
      return false;
  });
  let details1={
      opp:match.t2,
      score:match.t1s,
      oppScore:match.t2s,
      result:match.result
  };
(teams[t1idx].matches).push(details1);
let t2idx=teams.findIndex(function(team){
    if(team.name==match.t2)
    return true;
    else
    return false;
});
let details2={
    opp:match.t1,
    score:match.t2s,
    oppScore:match.t1s,
    result:match.result
};
(teams[t2idx].matches).push(details2);


  }
   
   
 }

).catch(function(err)
{console.log('error found');
    console.log(err);
});
