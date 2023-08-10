import compose from '../../compositionRoot';

import type { RebuildArgv } from './argv';

export async function rebuild(_argv: RebuildArgv) {
  const { fileDatabase } = await compose({ offline: true });
  console.log('Repairing database...');
  // eslint-disable-next-line unicorn/no-array-for-each
  await fileDatabase.multisynsets.filter((s) => {
    for (const lemma of s.synsets.isv!.lemmas) {
      const pos = lemma.steen?.partOfSpeech;
      if (pos === 'n.' || pos === 'f.' || pos === 'm.') {
        for (const lemma2 of s.synsets.en!.lemmas) {
          if (GUESS_WORDS.has(lemma2.value)) {
            console.log(s.synsets.isv!.lemmas.map((l) => l.value).join('\n'));
            break;
          }
        }
      }
    }

    return false;
  });
}

const GUESS_WORDS = new Set(`
ant
apple
aquarium
arrow
baby
backpack
bag
ball
balloon
banana
barn
basket
bat
bath
beach
bear
bed
bee
bell
bench
bicycle
bird
boat
book
bottle
bow
box
bread
bridge
broom
brush
bucket
butterfly
cake
camel
camera
car
carrot
cat
chair
cheese
chicken
circle
clock
cloud
coat
coffee
comb
cow
crab
crayon
cross
cup
curtain
daisy
deer
desk
dinosaur
dog
doll
donkey
door
duck
eagle
elephant
envelope
eye
fan
feather
fish
flag
flower
football
fork
frog
fruit
garden
giraffe
glasses
goat
guitar
hammer
hand
hat
heart
hen
horse
house
ice cream
jacket
kangaroo
key
kite
kitten
knife
ladder
lamp
leaf
lemon
lion
lollipop
mail
map
monkey
moon
mouse
mug
mushroom
nest
newspaper
nose
notebook
octopus
orange
owl
palm tree
panda
parrot
pear
pen
pencil
penguin
pig
pillow
pineapple
pizza
plate
rabbit
rainbow
rat
ring
river
robot
rocket
rose
ruler
sandwich
scissors
sea
sheep
shoe
shovel
skateboard
snail
snake
sock
sparrow
spider
spoon
square
squirrel
star
strawberry
sun
swan
table
teddy bear
tent
tiger
toilet
tomato
tooth
toothbrush
tractor
train
tree
triangle
turtle
umbrella
unicorn
vase
walrus
watch
watermelon
whale
wheel
window
wolf
yacht
zebra
`.trim().split(`\n`));
