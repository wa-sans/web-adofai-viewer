var w=canvas.width=1280;
var h=canvas.height=720;
var ctx=canvas.getContext('2d');

file.onchange=function()
{
  var f=file.files[0];
  var r=new FileReader();
  r.onload=function()
  {
    loadMap(JSON.parse(r.result));
  };
  r.readAsText(f);
};

var objs=[];
var tiles=[];
var tileSize=109.5;

var camera=
{
  x:0,
  y:0,
  baseX:0,
  baseY:0,
  moveX:0,
  moveY:0,
  baseRotate:0,
  moveRotate:1,
  rotate:0,
  baseZoom:1,
  moveZoom:1,
  zoom:1,
  relative:"Player",
  from:{},
  player:
  {
    x:0,
    y:0
  }
};

function loadMap(json)
{
  var map=conv(json);
  objs=[];
  tiles=[];

  function Tile(x,y,dir,tdir)
  {
    this.index=null;
    this.x=x;
    this.y=y;
    this.dir=dir;
    this.tdir=tdir;
    this.data=null;
    this.opacity=100;
    this.scale=1;
    this.draw=function()
    {
      if(this.scale>0)
      {
        var x=(this.x-camera.x)*tileSize/camera.zoom+w/2;
        var y=(this.y-camera.y)*tileSize/camera.zoom+h/2;
        ctx.save();
        ctx.translate(-x*(this.scale-1),-y*(this.scale-1));
        ctx.scale(this.scale,this.scale);
        ctx.beginPath();
        ctx.moveTo(x-Math.cos(this.tdir/180*Math.PI)*0.5*tileSize/camera.zoom,y-Math.sin(this.tdir/180*Math.PI)*0.5*tileSize/camera.zoom);
        ctx.lineTo(x,y);
        ctx.lineTo(x+Math.cos((this.tdir+this.dir-180)/180*Math.PI)*0.5*tileSize/camera.zoom,y+Math.sin((this.tdir+this.dir-180)/180*Math.PI)*0.5*tileSize/camera.zoom);
        ctx.strokeStyle='#000000';
        ctx.globalAlpha=this.opacity/100;
        ctx.lineWidth=20/camera.zoom;
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha=1;
      }
    };
    return this;
  }

  var tileX=0;
  var tileY=0;
  var tileDir=0;
  for(var i=0;i<map.length;i++)
  {
    let t=map[i];
    let rotate=t.rotate;
    let tile=new Tile(tileX,tileY,(t.dir*rotate+360)%360||360,tileDir);
    tile.index=i;
    tile.data=t;
    
    objs.push(tile);
    tiles.push(tile);
    tileDir+=((t.dir-180)*rotate+360)%360;
    tileX+=Math.cos(tileDir/180*Math.PI);
    tileY+=Math.sin(tileDir/180*Math.PI);
  }
}

function render()
{
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,w,h);
  ctx.translate(w/2,h/2);
  ctx.rotate(-camera.rotate/180*Math.PI);
  ctx.translate(-w/2,-h/2);
  camera.zoom*=1;
  for(var i=0;i<objs.length;i++)
  {
    var t=objs[i];
    if(camera.x-7*camera.zoom<t.x&&t.x<camera.x+7*camera.zoom&&camera.y-4*camera.zoom<t.y&&t.y<camera.y+4*camera.zoom)
    {
      t.draw();
    }
  }
  camera.zoom/=1;
  ctx.translate(w/2,h/2);
  ctx.rotate(camera.rotate/180*Math.PI);
  ctx.translate(-w/2,-h/2);
  window.requestAnimationFrame(render);
}
render();

var pressScreen=false;
var pp={x:0,y:0};
window.onmousedown=function(e)
{
  pp={x:e.clientX,y:e.clientY};
  pressScreen=true;
};
window.onmouseup=function()
{
  pressScreen=false;
};
window.onwheel=function(e)
{
  camera.zoom+=e.deltaY/126;
  camera.zoom=Math.max(camera.zoom,1);
};
window.onmousemove=function(e)
{
  if(pressScreen)
  {
    camera.x-=(e.clientX-pp.x)/tileSize*camera.zoom;
    camera.y-=(e.clientY-pp.y)/tileSize*camera.zoom;
    pp={x:e.clientX,y:e.clientY};
  }
};
