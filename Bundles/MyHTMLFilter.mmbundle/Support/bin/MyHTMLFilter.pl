#!/usr/bin/perl
use strict;
use warnings;

# Patterns to remove.
# Each pattern is an array of:
#  Start text match
#  End text match
#  Min length
#  Max length
#  Tag (for logging)
my @PATS = ( 
[ 'xxx', 'yyy', 800, 1150, 'xxx' ], 
[ 'aaa', 'bbb', 640, 680, 'aaa' ],
);

# Grab stdin and put in variable
my $msg = do { local $/; <> };

# remove Microsoft generate junk tags
$msg =~ s,</?o:[^>]*>,,g;

# remove long dash line junk
$msg =~ s,----------+,,g;

# remove empty line junk
$msg =~ s,\n\n+,\n,g;

# debug messages we can add to output
my $debug = "";

# junk removed
my $junk = 0;

# for each pattern
for my $pat (@PATS) {
  #$debug .= "Check @$pat[4]\n";
  my $i = 0;
  while (1) {
    # next occurrence of the pattern
    #$debug .= " starting from $i\n";
    my $x = index($msg, @$pat[0], $i);
    if ($x >= 0) {
      # jump the position forward for the next search
      $i = $x + 1;
      # look for the end of the pattern
      my $y = index($msg, @$pat[1], $x + length(@$pat[0]));
      if ($y >= 0) {
        # if we found start and end then figure out total length
        my $z = $y - $ x + length(@$pat[1]);
        $junk += $z;
        # check total length against our range
        if ($z > @$pat[2] && $z < @$pat[3]) {
          # if within range then remove entire match
          substr($msg, $x, $z) = "";
          $debug .= "@$pat[4] removed\n";
        } else {
          $debug .= "@$pat[4] length out of range $z,@$pat[2],@$pat[3]\n";
        }
      } else {
        $debug .= "@$pat[4] start $x no end\n";
      }
    } else {
      last; # no more occurrences of this pattern
    }
  }
}

# multiple blanks
$msg =~ s,<br>\n(<br>\n)+,<br>\n,g;

# message without debugging
#print $msg;

# message with debugging at the end
print substr($msg, 0, -17) , "\n<pre style='color:#0064A5'>$debug Removed $junk</pre>\n</body>\n</html>\n";
