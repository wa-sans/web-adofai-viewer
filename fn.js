function conv(map)
{
  var adofaiData=
  {
    tileDirection:
      {
        "R": 0,
        "A": 15,
        "M": 30,
        "C": 45,
        "B": 60,
        "Y": 75,
        "D": 90,
        "V": 105,
        "F": 120,
        "Z": 135,
        "N": 150,
        "x": 165,
        "L": 180,
        "W": 195,
        "H": 210,
        "Q": 225,
        "G": 240,
        "q": 255,
        "U": 270,
        "o": 285,
        "T": 300,
        "E": 315,
        "J": 330,
        "p": 345,
      }
  };

  function dirLength(d1,d2,r)
  {
    if(r==1)
    {
      return (360-d1+d2)%360;
    }
    if(r==-1)
    {
      return (360-d2+d1)%360;
    }
    return 0;
  }

  function tileToDirection(tile,actions)
  {
    var lastDir=0;
    var directArray=[];
    var rotate=1;
    for(var i=0;i<tile.length;i++)
    {
      for(var event in actions[i])
      {
        let e=actions[i][event];
        if(e.eventType=='Twirl')
        {
          rotate*=-1;
        }
      }
      let c=tile[i];
      if(c=='!')
      {
        directArray.push(
        {
          dir:0,
          rotate:rotate
        });
        continue;
      }
      let cd=adofaiData.tileDirection[c];
      let pc=tile[i-1]||'R';
      let pcd;
      if(pc=='!')
      {
        let mc=0;
        for(var j=i-1;j>0;j--)
        {
          if(tile[j]!='!')
          {
            break;
          }
          mc++;
        }
        pcd=(adofaiData.tileDirection[tile[i-mc-1]]+(180*(mc%2)))%360;
      }
      else
      {
        pcd=adofaiData.tileDirection[pc];
      }
      let dir;
      if(['5','6','7','8'].includes(c))
      {
        dir=dirLength(0,cd,rotate);
        if(['5','6','7','8'].includes(pc))
        {
          lastDir=(lastDir+cd+360)%360;
        }
        else
        {
          lastDir=(cd+pcd+360)%360;
        }
      }
      else
      {
        if(['5','6','7','8'].includes(pc))
        {
          dir=dirLength(lastDir,cd,rotate);
        }
        else
        {
          dir=dirLength((pcd+180)%360,cd,rotate);
        }
      }
      if(dir==0)
      {
        dir=360;
      }
      directArray.push(
      {
        dir:dir,
        rotate:rotate
      });
    }
    return directArray;
  }

  function tileToDirectionAngleData(tile,actions)
  {
    var lastDir=0;
    var directArray=[];
    var rotate=1;
    tile=tile.map(x=>x==999?999:360-x);
    for(var i=0;i<tile.length;i++)
    {
      for(var event in actions[i])
      {
        let e=actions[i][event];
        if(e.eventType=='Twirl')
        {
          rotate*=-1;
        }
      }
      let c=tile[i];
      if(c==999)
      {
        directArray.push(
        {
          dir:0,
          rotate:rotate
        });
        continue;
      }
      let cd=c;
      let pc=tile[i-1]||0;
      let pcd;
      if(pc==999)
      {
        let mc=0;
        for(var j=i-1;j>0;j--)
        {
          if(tile[j]!=999)
          {
            break;
          }
          mc++;
        }
        pcd=(tile[i-mc-1]+(180*(mc%2)))%360;
      }
      else
      {
        pcd=pc;
      }
      let dir;
      dir=dirLength((pcd+180)%360,cd,rotate);
      if(dir==0)
      {
        dir=360;
      }
      directArray.push(
      {
        dir:dir,
        rotate:rotate
      });
    }
    return directArray;
  }

  function tileBpmPush(bpm,tile,actions,isAngleData)
  {
    var list=isAngleData?tileToDirectionAngleData(tile,actions):tileToDirection(tile,actions);
    var result=[];
    for(var i=0;i<list.length;i++)
    {
      for(var event in actions[i])
      {
        let e=actions[i][event];
        if(e.eventType=='SetSpeed')
        {
          switch(e.speedType)
            {
              case 'Bpm':
                bpm=e.beatsPerMinute;
              break;
              case 'Multiplier':
                bpm*=e.bpmMultiplier;
              break;
              default:
              
              break;
            }
        }
      }
      result.push(
      {
        dir:list[i].dir,
        bpm:bpm,
        rotate:list[i].rotate,
        actions:(actions[i]||[]).slice(0)
      });
    }
    return result;
  }

  var actions=[];
  map.actions.forEach((a,i)=>
  {
    if(actions[a.floor]===undefined)
    {
      actions[a.floor]=[];
    }
    actions[a.floor].push(a);
  });
  var angleData=map.pathData!==undefined?map.pathData+map.pathData[map.pathData.length-1]:map.angleData;
  var data=tileBpmPush(map.settings.bpm,angleData,actions,map.pathData===undefined);
  return data;
}