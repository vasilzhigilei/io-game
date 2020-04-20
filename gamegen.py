import random
from helper import distance_objectpos

def generateWorld(size, seed, version=2): # takes seed, version=2 means it allows strings/bytes/ints
    random.seed(seed)

    # not to self, will need to address how block size and outer border work

    # will probably rework this system in the future
    block = 30
    blockedsize = int(size/block)
    world = {'trees':[], 'coconuts':[]}

    # let's create trees and rocks
    # codes: 0 - nothing, 1 - stone, 2 - palmtree, 3 - coconut palmtree
    
    # very basic tree gen
    for i in range(blockedsize):
        for j in range(blockedsize):
            if(random.randint(0,200) == 0):
                tooclose = False
                for tree in world['trees']:
                    if distance_objectpos(tree, i*block, j*block) < 200:
                        tooclose = True
                        break
                if(not tooclose):
                    world['trees'].append({'x':i*block, 'y':j*block})
                    if(random.randint(0,1) == 0):
                        world['coconuts'].append({'x':i*block, 'y':j*block})

    return world
