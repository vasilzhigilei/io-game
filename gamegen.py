import random
from helper import distance_objectpos

def generateWorld(size, seed, version=2): # takes seed, version=2 means it allows strings/bytes/ints
    random.seed(seed)

    world = {'size': size, 'water':[], 'trees':[], 'coconuts':[], 'walls':[]}

    chance = 300

    # Tree generation using blocks
    block = 20
    blockedsize = int(size/block)

    height = random.randint(100, 500)
    y = random.randint(0, size-height)
    world['water'].append({'y': y, 'width':size, 'height': height})

    for i in range(blockedsize):
        for j in range(blockedsize):
            skipj = False
            for water in world['water']:
                if j*block > water['y'] - 3*block and j*block < water['y'] + water['height'] + 3*block:
                    skipj = True
                    break
            if skipj:
                continue
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
