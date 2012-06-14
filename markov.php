<?php 

require 'markovEngine.php';



/*
$content = '';
while($row = mysql_fetch_array($results))
 {
  $postText = $row['post_content'];

  $postText = strip_tags($postText);
  //$content = str_replace("\n", "", $content);
  $postText = preg_replace("/\r?\n/m", "", $postText); 
  $postText = preg_replace("/\[.*?\]/", "", $postText); 

  $content = $content.' '.$postText;
}
 */ 
  
   $order = $_GET["order"]!=null ? $_GET["order"] : 6;	
   $length = $_GET["length"]!=null ? $_GET["length"] : 50;	
   $character = $_GET["character"]!=null ? $_GET["character"] : 'Vlad';	
   $begining = $_GET["begining"]!=null ? $_GET["begining"] : null;
   $act = $_GET["act"]!=null ? $_GET["act"] : 1;
   $act = ($act%2==0) ? 2 : 1;

$myFile = "resources/act".$act.$character."1Line.txt";
$fh = fopen($myFile, 'r');
$theData = fread($fh, filesize($myFile));
fclose($fh);
//echo $theData;
$content = $theData;   
 // $order = 6;
 // $length = 50;
  
  
  $markov_table = generate_markov_table($content, $order);
  $markov = generate_markov_text($length, $markov_table, $order,$begining);
  
  $markov_split = split('\?',$markov);  

    ?>

  <?php 
  $i = 0;
  foreach($markov_split as $split) {
	
	if($i!=0 && strlen($split)>50) {

  ?>
  <?php
		echo $split.'?';
	
 ?>
 
<?php
		}
		$i++;
	}
   ?>

