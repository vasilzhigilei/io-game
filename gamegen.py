import random

def generateWorld(size, seed, version=2): # takes seed, version=2 means it allows strings/bytes/ints
    random.seed(seed)

    # not to self, will need to address how block size and outer border work

    # will probably rework this system in the future
    blockedsize = int(size/50) # pixel size divided by 20 for 20x20 blocks
    world = [[0 for i in range(blockedsize)] for j in range(blockedsize)]

    # let's create trees and rocks
    # codes: 0 - nothing, 1 - stone, 2 - trees

    # very basic tree gen
    for i in range(len(world)):
        for j in range(len(world[i])):
            if(random.randint(0,30) == 0):
                world[i][j] = 2

    return world