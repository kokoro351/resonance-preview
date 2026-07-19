export type Track = {
  name:string; baseBpm:number; root:number; scale:number[]; bass:number[]; melody:number[]; arp:number[];
  modulation:number; wave:'sine'|'triangle'|'sawtooth'|'square';
  colors:{bg:string;primary:string;secondary:string;particle:string}; pattern:'rays'|'petals'|'rings'|'grid'|'nova';
};

export const TRACKS:Track[] = [
 {name:'LUMEN DRIVE',baseBpm:96,root:55,scale:[0,2,4,7,9,11,14,16],bass:[0,0,7,0,9,7,4,2],melody:[7,9,11,14,11,9,7,4],arp:[0,4,7,11],modulation:2,wave:'triangle',colors:{bg:'#05070d',primary:'#91a7ff',secondary:'#e4e9ff',particle:'#b6c2ff'},pattern:'rays'},
 {name:'EMBER PULSE',baseBpm:98,root:58.27,scale:[0,3,5,7,10,12,15,17],bass:[0,0,5,0,7,5,3,0],melody:[12,10,7,5,7,10,12,15],arp:[0,3,7,10],modulation:3,wave:'sawtooth',colors:{bg:'#0c0505',primary:'#ff8b72',secondary:'#ffe0d4',particle:'#ffb19f'},pattern:'petals'},
 {name:'AQUA BLOOM',baseBpm:94,root:65.41,scale:[0,2,5,7,9,12,14,17],bass:[0,0,5,0,9,7,5,2],melody:[5,7,9,12,9,7,5,2],arp:[0,5,9,12],modulation:5,wave:'sine',colors:{bg:'#031014',primary:'#55d7e8',secondary:'#d7fcff',particle:'#8beaf3'},pattern:'rings'},
 {name:'VIOLET GRID',baseBpm:97,root:49,scale:[0,2,3,7,8,10,14,15],bass:[0,0,3,0,7,3,2,0],melody:[14,10,8,7,8,10,14,15],arp:[0,3,7,10],modulation:4,wave:'square',colors:{bg:'#0d0613',primary:'#c183ff',secondary:'#f0d8ff',particle:'#d9b1ff'},pattern:'grid'},
 {name:'NOVA ASCENT',baseBpm:100,root:61.74,scale:[0,2,4,6,7,9,11,13],bass:[0,0,7,0,11,9,7,4],melody:[7,11,13,16,13,11,9,7],arp:[0,4,7,11,14],modulation:7,wave:'sawtooth',colors:{bg:'#07070b',primary:'#fff07c',secondary:'#fffbd6',particle:'#fff3a7'},pattern:'nova'},
];
