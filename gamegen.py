import random
from helper import distance_objectpos

def generateWorld(size, seed, version=2): # takes seed, version=2 means it allows strings/bytes/ints
    random.seed(seed)

    world = {'trees':[], 'coconuts':[]}

    # let's create trees and rocks
    # codes: 0 - nothing, 1 - stone, 2 - palmtree, 3 - coconut palmtree

    chance = 300

    # Tree generation using blocks
    block = 20
    blockedsize = int(size/block)

    for i in range(blockedsize):
        for j in range(blockedsize):
            if(random.randint(0, 500) == 0):
                tooclose = False
                for tree in world['trees']:
                    distance = distance_objectpos(tree, i*block, j*block)
                    if distance < 200:
                        tooclose = True
                        break
                if(not tooclose):
                    world['trees'].append({'x':i*block, 'y':j*block})
                    if(random.randint(0,1) == 0):
                        world['coconuts'].append({'x':i*block, 'y':j*block})


    return world
